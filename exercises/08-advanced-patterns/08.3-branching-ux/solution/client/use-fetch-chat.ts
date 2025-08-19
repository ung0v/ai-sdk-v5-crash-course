import { useSuspenseQuery } from '@tanstack/react-query';
import type { DB } from '../api/persistence-layer.ts';

export const useFetchChat = (
  chatIdFromSearchParams: string | null,
) => {
  const { data } = useSuspenseQuery({
    queryKey: ['chat', chatIdFromSearchParams],
    staleTime: Infinity,
    queryFn: () => {
      if (!chatIdFromSearchParams) {
        return null;
      }

      return fetch(
        `/api/get-chat?chatId=${chatIdFromSearchParams}`,
      ).then(
        (
          res,
        ): Promise<{
          chat: DB.Chat;
          messageMap: Record<string, DB.Message>;
        }> => res.json(),
      );
    },
  });

  return data;
};
