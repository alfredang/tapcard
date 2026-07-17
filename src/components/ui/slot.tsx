import * as React from "react";

/**
 * Minimal Slot — merges the component's props/className onto its single child.
 * Avoids pulling in @radix-ui/react-slot for our small `asChild` needs.
 */
export const Slot = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }
>(({ children, className, ...props }, ref) => {
  // Tolerate arrays / falsy siblings (e.g. `{cond && <X/>}{child}`): pick the
  // single real element rather than blanking out when children isn't one node.
  const only = React.Children.toArray(children).find(React.isValidElement);
  if (!only) return null;
  const child = only as React.ReactElement<Record<string, unknown>>;
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
