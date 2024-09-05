// import { useSession } from "next-auth/react";

// export function useAuth() {
//     const { data: session, status } = useSession();
//     return {
//         user: session?.user,
//         status,
//         isAuthenticated: !!session
//     };
// }

import { useSession } from "next-auth/react";
import { useEffect } from "react";

export function useAuth() {
    const { data: session, status } = useSession();

    useEffect(() => {
        // Only trigger session refresh when the tab becomes visible
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetch('/api/auth/session');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    return {
        user: session?.user,
        status,
        isAuthenticated: !!session
    };
}
