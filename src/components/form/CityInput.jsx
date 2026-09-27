import { useId } from "react";
import { Input } from "@/components/ui/input";
import { CITIES } from "@/lib/constants";

/** Ô thành phố: gõ tự do, gợi ý các thành phố có sẵn. */
export function CityInput(props) {
  const listId = useId();
  return (
    <>
      <Input {...props} list={listId} autoComplete="address-level2" placeholder="Hà Nội" />
      <datalist id={listId}>
        {CITIES.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
    </>
  );
}
