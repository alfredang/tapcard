import * as React from "react";

/**
 * Minimal Slot — merges the component's props/className onto its single child.
 * Avoids pulling in @radix-ui/react-slot for our small `asChild` needs.
 */
export const Slot = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }
>(({ children, className, ...props }, ref) => {
  if (!React.isValidElement(children)) return null;
  const child = children as React.ReactElement<Record<string, unknown>>;
  const childProps = child.props;
  return React.cloneElement(child, {
    ...props,
    ...childProps,
    ref,
    className: [className, childProps.className as string]
      .filter(Boolean)
      .join(" "),
  } as Record<string, unknown>);
});
Slot.displayName = "Slot";
