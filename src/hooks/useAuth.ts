import { useSession } from "next-auth/react";
import { useEffect, useCallback } from "react";

export function useAuth() {
    const { data: session, status, update } = useSession();

    const refreshSession = useCallback(() => {
        if (!document.hidden) {
            update();
        }
    }, [update]);

    useEffect(() => {
        document.addEventListener('visibilitychange', refreshSession);
        return () => {
            document.removeEventListener('visibilitychange', refreshSession);
        };
    }, [refreshSession]);

    return {
        user: session?.user,
        status,
        isAuthenticated: !!session
    };
}
