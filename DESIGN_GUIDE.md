# GitDocify Design Guide

## Color Scheme

The GitDocify design follows a consistent color palette using CSS variables:

```css
:root {
  /* GitDocify theme */
  --background: #fff9f0; /* Lighter cream background */
  --foreground: #825d45;
  --primary: #ff4b55; /* Bright red from GitDocify logo */
  --primary-hover: #ff6b74;
  --card-bg: #ffffff; /* Pure white cards */
  --card-bg-secondary: #fffaf4;
  --card-hover: #fff7eb;
  --border: #f3e1cc;
  --text-primary: #825d45;
  --text-secondary: #9b7b66;
  --text-muted: #b39884;
}
```

## Typography

Font: 'PPMori' for all text

- Regular (400) for body text
- SemiBold (600) for headings

## Components

### Buttons

Primary Button:

```jsx
<button className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors">
  Button Text
</button>
```

Secondary Button:

```jsx
<button className="px-4 py-2 text-primary hover:text-primary-hover border border-border rounded-lg hover:bg-card-hover transition-colors">
  Button Text
</button>
```

### Cards

Standard Card:

```jsx
<div className="bg-card-bg rounded-xl shadow-md border border-border p-6">
  <h2 className="text-xl font-semibold text-text-primary mb-4">Card Title</h2>
  {/* Card content */}
</div>
```

### Inputs

Text Input:

```jsx
<input
  type="text"
  placeholder="Placeholder text"
  className="w-full p-4 border border-border rounded-lg bg-card-bg text-text-primary placeholder-text-muted focus:outline-none"
/>
```

Select Input:

```jsx
<select className="px-4 py-2 border border-border rounded-lg bg-card-bg text-text-primary focus:outline-none">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

### Star Decorations

To add star decorations to a page:

```jsx
<Star color="red" size={40} top="15%" left="10%" rotate={15} />
<Star color="green" size={32} top="25%" right="15%" rotate={-10} />
<Star color="red" size={24} bottom="30%" left="15%" rotate={20} />
<Star color="green" size={48} bottom="20%" right="10%" rotate={5} />
```

## Page Layout

Consistent page layout structure:

```jsx
<div className="min-h-screen flex flex-col">
  <Header />

  <main className="flex-grow relative overflow-hidden">
    {/* Star decorations */}
    <Star color="red" size={40} top="15%" left="10%" rotate={15} />
    <Star color="green" size={32} top="25%" right="15%" rotate={-10} />
    <Star color="red" size={24} bottom="30%" left="15%" rotate={20} />
    <Star color="green" size={48} bottom="20%" right="10%" rotate={5} />

    {/* Page content */}
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* Content goes here */}
    </div>
  </main>

  <footer className="py-6 border-t border-border text-center text-text-muted text-sm">
    <div className="max-w-5xl mx-auto">
      <p>© {new Date().getFullYear()} GitDocify. Made with ❤️</p>
    </div>
  </footer>
</div>
```
