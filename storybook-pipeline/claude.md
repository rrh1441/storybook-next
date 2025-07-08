Of course. Creating a comprehensive prompt file is a great way to guide an AI agent. This `Claude.md` file synthesizes all our decisions and outlines the remaining tasks to complete the "Storybook" application.

Here is the file content. You can save this as `Claude.md` and provide it to your agent.

---

# Claude.md

## Project Goal

The primary goal is to complete the development of "Storybook", a web application built in a repository cloned from a previous "StoryTime" project. The application allows authenticated users to generate personalized, printable children's storybooks. The final output for the user is a downloadable PDF file containing AI-generated text and page-by-page illustrations.

## Core Requirements & Constraints

1.  **Repository:** The work is being done in the `storybook` repository, which is a clone of the "StoryTime" app.
2.  **Branding:** The application's name is "Storybook". The tagline is "Your Ideas, Their Adventures".
3.  **Authentication:** The app connects to an existing Supabase instance (`cowarfrtvqbhywyilpan`) and uses its shared authentication (`auth`) and `users` table.
4.  **No Free Tier:** There is no free usage. All storybook creation features require a user to be logged in. All mentions of "free" should be removed.
5.  **Data Model:** The application uses new, dedicated tables (`storybooks`, `storybook_pages`) in the shared Supabase instance. It must **not** interact with the old `stories` or `story_readings` tables.
6.  **Technology Stack:** React, Vite, TypeScript, Tailwind CSS, Shadcn UI, TanStack Query, React Hook Form, Zod.
7.  **AI Services:**
    * **Text Generation:** Anthropic (via `storybook-generate-text` Supabase function).
    * **Image Generation:** Fal AI's Flux model (via `storybook-generate-images` Supabase function).
8.  **Final Output:** A multi-page PDF document.

## Phase 1: Backend Implementation (Completed)

The following backend resources have already been defined and should be implemented in the shared Supabase instance.

### 1. SQL Schema

```sql
-- Create the storybooks table
CREATE TABLE public.storybooks (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    title text,
    theme text NOT NULL,
    main_character text,
    educational_focus text,
    reference_image_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.storybooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to manage their own storybooks" ON public.storybooks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create the storybook_pages table
CREATE TABLE public.storybook_pages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    storybook_id uuid NOT NULL REFERENCES public.storybooks(id) ON DELETE CASCADE,
    page_number integer NOT NULL,
    text text,
    image_prompt text,
    image_url text,
    image_status text DEFAULT 'pending'::text NOT NULL, -- pending, generating, completed, failed
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT storybook_pages_unique_page_number UNIQUE (storybook_id, page_number)
);
ALTER TABLE public.storybook_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to select/manage pages for their storybooks" ON public.storybook_pages FOR ALL USING (
  EXISTS (SELECT 1 FROM public.storybooks sb WHERE sb.id = storybook_pages.storybook_id AND sb.user_id = auth.uid())
);
```

### 2. Supabase Storage

A public bucket named `storybook-assets` has been created.

### 3. Supabase Functions

* **`storybook-generate-text/index.ts`:**
    ```typescript
    import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
    import Anthropic from 'npm:@anthropic-ai/sdk@0.39.0';
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) { console.error("ANTHROPIC_API_KEY is not set!"); }
    const anthropic = anthropicApiKey ? new Anthropic({ apiKey: anthropicApiKey }) : null;
    const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
    const TITLE_MARKER = "Generated Title:";
    const DEFAULT_AGE_DESCRIPTION = "suitable for young children";
    const TARGET_PAGE_COUNT = 7;
    serve(async (req) => {
      if (req.method === 'OPTIONS') { return new Response('ok', { headers: corsHeaders }); }
      if (req.method !== 'POST') { return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}); }
      if (!anthropic) { return new Response(JSON.stringify({ error: 'AI provider not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}); }
      try {
        const { theme = "adventure", mainCharacter, educationalFocus, additionalInstructions } = await req.json();
        const characterDesc = mainCharacter ? ` The main character is named ${mainCharacter}.` : " The story features a child protagonist.";
        const eduFocus = educationalFocus ? ` The story should subtly incorporate the theme of ${educationalFocus}.` : "";
        const addInstructions = additionalInstructions ? ` Additional user requests: ${additionalInstructions}` : "";
        const prompt = `Write a children's story ${DEFAULT_AGE_DESCRIPTION}. The story should have a theme of ${theme}.${characterDesc}${eduFocus}${addInstructions}. The story should be engaging and age-appropriate. Divide the story into exactly ${TARGET_PAGE_COUNT} paragraphs. Each paragraph represents a page and should be a self-contained part of the narrative flow. Output the result ONLY as a JSON string array where each element is the text for one page (one paragraph). Do not include any other text before or after the JSON array itself. Example Output Format: ["Paragraph 1 text...", "Paragraph 2 text...", ..., "Paragraph ${TARGET_PAGE_COUNT} text..."]. After the JSON array, on a new line, suggest a suitable and creative title for this children's story. Output the title on that single, separate line, preceded by the exact marker "${TITLE_MARKER}". Do not add any other text after the title line.`;
        const msg = await anthropic.messages.create({ model: "claude-3-5-sonnet-20240620", max_tokens: 1500, messages: [{ role: "user", content: prompt }] });
        const rawResponse = msg.content[0]?.type === 'text' ? msg.content[0].text.trim() : null;
        if (!rawResponse) { throw new Error('Anthropic response content was empty or not text.'); }
        let pageTexts = []; let title = `A ${theme} Story`; let jsonEndIndex = -1;
        if (rawResponse.startsWith('[')) { let balance = 0; for (let i = 0; i < rawResponse.length; i++) { if (rawResponse[i] === '[') balance++; else if (rawResponse[i] === ']') balance--; if (balance === 0 && rawResponse[i] === ']') { jsonEndIndex = i; break; } } }
        if (jsonEndIndex !== -1) {
          const jsonString = rawResponse.substring(0, jsonEndIndex + 1);
          try { pageTexts = JSON.parse(jsonString); if (!Array.isArray(pageTexts) || pageTexts.some(p => typeof p !== 'string')) { pageTexts = []; } } catch (e) { pageTexts = []; }
          const remainingText = rawResponse.substring(jsonEndIndex + 1).trim();
          const titleMarkerIndex = remainingText.indexOf(TITLE_MARKER);
          if (titleMarkerIndex !== -1) { const extractedTitle = remainingText.substring(titleMarkerIndex + TITLE_MARKER.length).trim(); const firstNewline = extractedTitle.indexOf('\n'); title = firstNewline === -1 ? extractedTitle : extractedTitle.substring(0, firstNewline).trim(); if (!title) { title = `A ${theme} Story`; } }
        } else { pageTexts = rawResponse.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0); }
        if (pageTexts.length === 0) { throw new Error("Failed to extract valid story pages from the AI response."); }
        return new Response(JSON.stringify({ pageTexts, title }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
      } catch (error) { const message = error instanceof Error ? error.message : 'Failed to generate story text.'; return new Response(JSON.stringify({ error: message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }); }
    });
    ```

* **`storybook-generate-images/index.ts`:**
    ```typescript
    import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
    import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@^2.40.0';
    import { decode as base64Decode } from "https://deno.land/std@0.208.0/encoding/base64.ts";
    const falApiKey = Deno.env.get('FAL_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!falApiKey || !supabaseUrl || !supabaseServiceKey) { console.error("Missing required environment variables"); }
    const supabaseAdmin: SupabaseClient = createClient(supabaseUrl!, supabaseServiceKey!);
    const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
    const FAL_API_HOST = "https://fal.run";
    const FAL_MODEL_ENDPOINT = "/fal-ai/flux-image-to-image";
    const STORAGE_BUCKET = "storybook-assets";
    function createSummary(text: string, maxLength = 50): string { if (!text) return "A scene from the story"; const cleanedText = text.replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim(); const words = cleanedText.split(' '); const maxWords = Math.min(15, Math.floor(maxLength / 5)); let summary = words.slice(0, maxWords).join(' '); if (summary.length > maxLength) { summary = summary.substring(0, maxLength - 3) + "..."; } else if (words.length > maxWords) { summary += "..."; } if (!summary) return "A scene from the story"; return summary; }
    serve(async (req) => {
        if (req.method === 'OPTIONS') { return new Response('ok', { headers: corsHeaders }); }
        if (req.method !== 'POST') { return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}); }
        if (!falApiKey) { return new Response(JSON.stringify({ error: 'Image generation provider not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}); }
        try {
            const { storybook_id, reference_image_url } = await req.json();
            if (!storybook_id || !reference_image_url) { throw new Error("Missing required parameters: storybook_id and reference_image_url"); }
            const { data: pages, error: fetchError } = await supabaseAdmin.from('storybook_pages').select('id, page_number, text').eq('storybook_id', storybook_id).order('page_number', { ascending: true });
            if (fetchError) throw fetchError;
            if (!pages || pages.length === 0) throw new Error("No pages found for this storybook.");
            for (const page of pages) {
                const pageId = page.id; const pageNum = page.page_number; const pageText = page.text || "";
                await supabaseAdmin.from('storybook_pages').update({ image_status: 'generating', updated_at: new Date().toISOString() }).eq('id', pageId);
                try {
                    const summary = createSummary(pageText);
                    const imagePrompt = `Children's storybook illustration, whimsical and bright style. Scene showing: ${summary}`;
                    await supabaseAdmin.from('storybook_pages').update({ image_prompt: imagePrompt }).eq('id', pageId);
                    const falInput = { "image_url": reference_image_url, "prompt": imagePrompt, "seed": Math.floor(Math.random() * 100000), "strength": 0.6 };
                    const falResponse = await fetch(FAL_API_HOST + FAL_MODEL_ENDPOINT, { method: "POST", headers: { "Authorization": `Key ${falApiKey}`, "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify({ inputs: falInput }) });
                    if (!falResponse.ok) { const errorBody = await falResponse.text(); throw new Error(`Fal AI API Error (${falResponse.status}): ${errorBody}`); }
                    const falResult = await falResponse.json();
                    if (!falResult || !falResult.images || !falResult.images[0] || !falResult.images[0].content) { throw new Error("Invalid response format from Fal AI."); }
                    const base64Image = falResult.images[0].content; const contentType = falResult.images[0].content_type || 'image/png';
                    const imageBuffer = base64Decode(base64Image).buffer;
                    const filePath = `images/${storybook_id}/page_${pageNum}.png`;
                    const { error: uploadError } = await supabaseAdmin.storage.from(STORAGE_BUCKET).upload(filePath, imageBuffer, { contentType: contentType, upsert: true });
                    if (uploadError) throw uploadError;
                    const { data: urlData } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
                    if (!urlData || !urlData.publicUrl) throw new Error("Failed to get public URL for uploaded image.");
                    await supabaseAdmin.from('storybook_pages').update({ image_url: urlData.publicUrl, image_status: 'completed', updated_at: new Date().toISOString() }).eq('id', pageId);
                } catch (pageError) { await supabaseAdmin.from('storybook_pages').update({ image_status: 'failed', updated_at: new Date().toISOString() }).eq('id', pageId); }
            }
            return new Response(JSON.stringify({ success: true, message: `Image generation process completed for ${pages.length} pages.` }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
        } catch (error) { const message = error instanceof Error ? error.message : 'Failed to generate images.'; return new Response(JSON.stringify({ error: message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }); }
    });
    ```

## Phase 2: Frontend Implementation (Tasks to Complete)

The repository has been cloned, and placeholder pages (`StorybookLibrary.tsx`, `StorybookPreview.tsx`) have been added. The copy on static pages (`Home`, `Navbar`, `Footer`, etc.) has been updated. The main task is to implement the core creation and display logic.

### 1. Implement `StorybookCreator.tsx`

This is the most critical page. It should guide the user through a multi-step process.

**A. Gating & Setup:**
* At the top of the component, use the `useAuth` hook to get the `user`. If the user is not authenticated, redirect them to `/login` using `useNavigate`.
* Define a Zod schema `storybookParamsSchema` for the input form: `{ theme: z.string(), mainCharacter: z.string().optional(), educationalFocus: z.string().optional(), additionalInstructions: z.string().max(500).optional(), referenceImageUrl: z.string().url() }`.
* Set up the `useForm` hook with this schema.
* Manage state: `useState<string[]>([])` for `pageTexts`, `useState<string | null>(null)` for `storybookId`, etc.

**B. UI (using Shadcn `Tabs`):**
* **Tab 1: "Outline"**
    * Render the form fields defined in the Zod schema, including the new input for `referenceImageUrl`.
    * The "Generate Story Text" button should be disabled while the `generateStorybookTextMutation` is pending. On click, it triggers the mutation.
* **Tab 2: "Edit Text"**
    * This tab should be disabled until `pageTexts` has content.
    * Display the `pageTexts` array, rendering a `Textarea` for each page to allow user edits.
    * The "Save & Generate Images" button should be disabled until the text is saved or while the save/image generation mutations are pending.
* **Tab 3: "Images & PDF"**
    * This tab should be disabled until images are successfully generated.
    * Display the status of image generation.
    * Once complete, show a preview of each page with its corresponding generated image and text.
    * Include a "Download PDF" button that triggers the PDF generation logic.

**C. Mutations (`@tanstack/react-query`):**
* **`generateStorybookTextMutation`:** Calls the `storybook-generate-text` function. On success, it populates the `pageTexts` state and switches the active tab to "Edit Text".
* **`saveAndGenerateImagesMutation`:**
    1.  **Save Text:** First, it creates a new record in the `storybooks` table. Then, it iterates through the `pageTexts` state and creates corresponding records in the `storybook_pages` table, saving the `page_number` and `text`. It should get the new `storybook_id`.
    2.  **Trigger Image Generation:** On successful save, it immediately calls the `storybook-generate-images` Supabase function, passing the new `storybook_id` and the `reference_image_url`.
    3.  **UI Feedback:** Show loading indicators throughout this process. On success, switch to the "Images & PDF" tab and start polling or refetching data to get the updated image URLs.

### 2. Implement `StorybookLibrary.tsx`

* This page should be the user's dashboard, accessible at `/dashboard` or `/storybooks`.
* Use `useQuery` to fetch all records from the `storybooks` table where `user_id` matches the current authenticated user's ID.
* Map over the results and display each storybook using a card component (e.g., `StorybookCard.tsx`).
* The card should display the storybook title and a thumbnail (e.g., the image from the first page, `storybook_pages` where `page_number` is 1).
* Each card should link to the preview page: `/storybook/:storybookId`.

### 3. Implement `StorybookPreview.tsx`

* Fetch the specific storybook and its pages (with text and image URLs) using the `storybookId` from the route params (`useParams`).
* Display the pages sequentially.
* Implement the **Download PDF** functionality.
    * Use the `jspdf` library.
    * Create a new PDF document.
    * Iterate through the fetched pages: for each page, use `doc.addImage()` and `doc.text()` to place the illustration and text on a new page in the PDF.
    * Use `doc.save('my-storybook.pdf')` to trigger the download. You may need to handle CORS for images by fetching them as blobs if `addImage` doesn't work with direct Supabase Storage URLs.

### User Flow to Implement

1.  A user signs up or logs in.
2.  They navigate to the "Create Storybook" page.
3.  They fill out the outline form and click "Generate Story Text".
4.  They review/edit the generated text and click "Save & Generate Images".
5.  They see the image generation progress and then the final result.
6.  They click "Download PDF" to get the final file.
7.  They can view all their created storybooks on the "My Storybooks" page.