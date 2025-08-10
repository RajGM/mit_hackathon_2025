// @ts-nocheck
import { auth, firestore } from '@lib/firebase';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth'

export function useUserData() {
    const [user, loading, error] = useAuthState(auth)

    const logout = async () => {
        try {
            await signOut(auth)
        } catch (e) {
            console.error('Failed to sign out:', e)
        }
    }

    return { user, loading, error, logout }
}
