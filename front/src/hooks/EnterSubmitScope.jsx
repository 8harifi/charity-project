import { useEnterSubmit } from "./useEnterSubmit";

/**
 * Wraps form content so Enter triggers submit/next (skips textarea).
 */
export default function EnterSubmitScope({ onSubmit, children, className, as: Tag = "div", ...rest }) {
  const onKeyDown = useEnterSubmit(onSubmit);
  return (
    <Tag className={className} onKeyDown={onKeyDown} {...rest}>
      {children}
    </Tag>
  );
}
