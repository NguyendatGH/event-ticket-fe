import * as React from "react"
import { LayoutGroup, motion } from "motion/react"
import { cn } from "@/lib/utils"
import { Tabs as TabsPrimitive } from "radix-ui"
import { TabIndicator } from "@/components/motion/TabIndicator"

// Tab chữ + gạch chân xanh 2px trượt theo tab đang chọn (design-spec: không nền bo tròn cho mục đang chọn).
// Radix không cho Trigger biết giá trị đang chọn → Tabs giữ value (controlled hoặc không) trong context.
const TabsCtx = React.createContext(null)

function Tabs({
  className,
  orientation = "horizontal",
  value,
  defaultValue,
  onValueChange,
  ...props
}) {
  const [inner, setInner] = React.useState(defaultValue)
  const current = value ?? inner
  const id = React.useId()
  return (
    <TabsCtx.Provider value={current}>
      <LayoutGroup id={id}>
        <TabsPrimitive.Root
          data-slot="tabs"
          data-orientation={orientation}
          orientation={orientation}
          value={current}
          onValueChange={(v) => {
            setInner(v)
            onValueChange?.(v)
          }}
          className={cn(
            "group/tabs flex gap-6 data-[orientation=horizontal]:flex-col",
            className
          )}
          {...props}
        />
      </LayoutGroup>
    </TabsCtx.Provider>
  )
}

function TabsList({
  className,
  children,
  ...props
}) {
  return (
    <TabsPrimitive.List
      asChild
      data-slot="tabs-list"
      className={cn(
        "flex w-full items-end gap-6 overflow-x-auto border-b border-border text-muted-foreground no-scrollbar group-data-[orientation=vertical]/tabs:w-fit group-data-[orientation=vertical]/tabs:flex-col group-data-[orientation=vertical]/tabs:items-stretch group-data-[orientation=vertical]/tabs:gap-0 group-data-[orientation=vertical]/tabs:border-r group-data-[orientation=vertical]/tabs:border-b-0",
        className
      )}
      {...props}
    >
      {/* layoutScroll: danh sách cuộn ngang không làm lệch phép đo của gạch chân. */}
      <motion.div layoutScroll>{children}</motion.div>
    </TabsPrimitive.List>
  )
}

function TabsTrigger({
  className,
  value,
  children,
  ...props
}) {
  const active = React.useContext(TabsCtx) === value
  return (
    <TabsPrimitive.Trigger
      value={value}
      data-slot="tabs-trigger"
      className={cn(
        "relative -mb-px inline-flex cursor-pointer items-center gap-1.5 border-b-2 border-transparent pt-1 pb-3 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors focus-ring hover:text-foreground focus-visible:text-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground",
        "group-data-[orientation=vertical]/tabs:mr-[-1px] group-data-[orientation=vertical]/tabs:mb-0 group-data-[orientation=vertical]/tabs:border-r-2 group-data-[orientation=vertical]/tabs:border-b-0 group-data-[orientation=vertical]/tabs:py-2.5 group-data-[orientation=vertical]/tabs:pr-4",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      {active ? (
        <TabIndicator
          id="tabs-indicator"
          className="group-data-[orientation=vertical]/tabs:inset-x-auto group-data-[orientation=vertical]/tabs:inset-y-0 group-data-[orientation=vertical]/tabs:-right-px group-data-[orientation=vertical]/tabs:bottom-auto group-data-[orientation=vertical]/tabs:h-auto group-data-[orientation=vertical]/tabs:w-0.5"
        />
      ) : null}
    </TabsPrimitive.Trigger>
  )
}

function TabsContent({
  className,
  ...props
}) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1 data-[state=active]:duration-200 data-[state=active]:ease-out-expo", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
