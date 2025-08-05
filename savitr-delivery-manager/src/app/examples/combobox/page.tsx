import { Metadata } from "next"
import ComboboxExample from "@/components/examples/ComboboxExample"

export const metadata: Metadata = {
  title: "Combobox Example - Savitr Delivery Manager",
  description: "A demonstration of the Combobox component for searchable dropdowns",
}

export default function ComboboxExamplePage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-10 space-y-2">
        <h1 className="text-3xl font-bold">Combobox Component</h1>
        <p className="text-muted-foreground">
          A searchable dropdown component for selecting from a list of options with autocomplete functionality.
        </p>
      </div>
      
      <ComboboxExample />
      
      <div className="mt-16">
        <h2 className="text-xl font-semibold mb-4">Component Usage</h2>
        <pre className="bg-slate-900 text-slate-50 p-4 rounded-md overflow-auto">
          {`import { Combobox } from "@/components/ui/combobox"

// Define your options
const options = [
  { value: "option-1", label: "Option 1" },
  { value: "option-2", label: "Option 2" },
  // ...more options
]

// In your component
const [value, setValue] = useState("")

return (
  <Combobox
    options={options}
    value={value}
    onChange={setValue}
    placeholder="Select an option"
    searchPlaceholder="Search options..."
  />
)`}
        </pre>
      </div>
    </div>
  )
} 