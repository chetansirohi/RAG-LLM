import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useChats() {
    const { data: chats, error, mutate } = useSWR('/api/chats', fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        refreshInterval: 60000, // Refresh every minute
    });

    return {
        chats,
        isLoading: !error && !chats,
        isError: error,
        mutate,
    };
}