// Ô thành phố: gõ tự do, có gợi ý sẵn.

import { useId } from "react";
import { Input } from "@/components/ui/input";
import { CITIES } from "@/lib/constants";

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
