import { ReactNode, useEffect, useRef, useState } from "react";

interface ScrollableContainerProps {
  children: ReactNode;
  isLoading?: boolean;
  classNames?: string;
}

const isAtBottom = (element: HTMLDivElement) => {
  return element.scrollHeight - element.scrollTop - element.clientHeight <= 1;
};
const isAtTop = (element: HTMLDivElement) => {
  return element.scrollTop === 0;
};
const isScrollable = (element: HTMLDivElement) => {
  return element.scrollHeight - element.clientHeight > 5;
};

export const ScrollableContainer: React.FC<ScrollableContainerProps> = ({
  children,
  isLoading,
  classNames,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const [showScroll, setShowScroll] = useState<boolean>(false);
  const [showTop, setShowTop] = useState<boolean>(false);
  const [showBottom, setShowBottom] = useState<boolean>(false);

  useEffect(() => {
    if (isLoading || !ref.current) return;
    if (isAtTop(ref.current)) {
      setShowBottom(true);
    }
    setShowScroll(isScrollable(ref.current));
  }, [isLoading]);

  return (
    <div
      ref={ref}
      className={`gradient-border ${
        showScroll ? "overflow-y-scroll" : "overflow-y-hidden"
      } overflow-x-hidden ${classNames}`}
      onScroll={(e) => {
        if (!ref.current) return;
        setShowTop(isAtBottom(e.currentTarget));
        setShowBottom(isAtTop(e.currentTarget));
      }}
    >
      <div
        id="scrollable-container-content"
        className="relative lcd lcd-grid -m-1 flex flex-col gap-2 p-2 overflow-clip"
      >
        {showScroll && showTop ? (
          <div className="blink sticky top-0 self-end h-0 overflow-visible">
            ^
          </div>
        ) : null}

        {children}

        {showScroll && showBottom ? (
          <div className="blink rotate-180 sticky bottom-0 h-0 overflow-visible">
            ^
          </div>
        ) : null}
      </div>
    </div>
  );
};
