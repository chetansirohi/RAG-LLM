import { useSession as useNextAuthSession } from "next-auth/react";
import { useState, useEffect } from "react";

export function useCustomSession() {
    const { data: session, status } = useNextAuthSession();
    const [cachedSession, setCachedSession] = useState(session);

    useEffect(() => {
        if (session) {
            setCachedSession(session);
        }
    }, [session]);

    return { data: cachedSession, status };
}