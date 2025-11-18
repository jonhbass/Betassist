import { useEffect } from 'react';

export function useAutoScroll(listRef, dependencies = []) {
  useEffect(() => {
    if (listRef.current) {
      const scrollContainer = listRef.current.querySelector('.ba-chat-list');
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}
