## Plan: Set uploaded logo as app favicon

The uploaded image is a full logo with text ("PHILANTHROPY COMMAND CENTER"). At typical favicon sizes (16×16, 32×32), the text will be unreadable. The plan below handles this.

### Step 1: Generate a favicon-ready crop
Extract just the top icon portion (compass, chart bars, and swoosh) from the uploaded image, removing the text below. Output as a clean 1:1 PNG with a transparent background, sized appropriately for favicon use.

### Step 2: Save to public directory
Write the generated favicon PNG to `public/favicon.png`.

### Step 3: Wire it into the root route
Add a favicon link in `src/routes/__root.tsx` inside the existing `links` array:
```tsx
{ rel: "icon", type: "image/png", href: "/favicon.png" }
```

No other files need to change.