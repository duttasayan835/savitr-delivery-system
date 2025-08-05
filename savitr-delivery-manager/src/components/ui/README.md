# UI Components

This directory contains reusable UI components based on the shadcn/ui design system, which is a collection of reusable UI components built on top of Radix UI primitives.

## Combobox Component

The Combobox component provides an enhanced select dropdown with search functionality (autocomplete). It's perfect for situations where users need to select from a large list of options.

### Installation

The Combobox component requires the following dependencies:
- `@radix-ui/react-popover`
- `@radix-ui/react-dialog`
- `cmdk`

These dependencies should already be installed in the project.

### Usage

```tsx
import { useState } from "react";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";

// Define your options
const options: ComboboxOption[] = [
  { value: "option-1", label: "Option 1" },
  { value: "option-2", label: "Option 2" },
  // Add more options as needed
];

export default function MyComponent() {
  const [value, setValue] = useState("");

  return (
    <Combobox
      options={options}
      value={value}
      onChange={setValue}
      placeholder="Select an option"
      searchPlaceholder="Search..."
      emptyMessage="No results found."
    />
  );
}
```

### Props

| Prop               | Type                | Description                                      | Default         |
|--------------------|---------------------|--------------------------------------------------|-----------------|
| `options`          | `ComboboxOption[]`  | Array of options to display in the dropdown      | Required        |
| `value`            | `string`            | Currently selected value                         | Required        |
| `onChange`         | `(value: string) => void` | Function called when selection changes     | Required        |
| `placeholder`      | `string`            | Placeholder text when no option is selected      | "Select option" |
| `searchPlaceholder`| `string`            | Placeholder text for the search input            | "Search..."     |
| `emptyMessage`     | `string`            | Message shown when no options match the search   | "No results found." |
| `className`        | `string`            | Additional CSS classes for the component         | undefined       |
| `disabled`         | `boolean`           | Whether the combobox is disabled                 | false           |

### ComboboxOption Type

```ts
export interface ComboboxOption {
  value: string;
  label: string;
}
```

## Related Components

The Combobox is built using the following components, which can also be used individually:

- `Command`: A command menu used for keyboard-centric interactions
- `Popover`: A floating panel that displays relative to another element
- `Dialog`: A modal dialog that appears in front of the page content

## Example

To see a complete example, visit the `/examples/combobox` page in the application.

## Additional Resources

- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [shadcn/ui](https://ui.shadcn.com/)
- [CMDK](https://cmdk.paco.me/) 