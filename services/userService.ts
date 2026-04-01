import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { User, UserRole } from "../types";

export const UserService = {
    async createUser(user: User): Promise<void> {
        try {
            console.log("UserService: Attempting to save user...", user.id);
            const userRef = doc(db, "users", user.id);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    ...user,
                    createdAt: serverTimestamp(),
                    lastLogin: serverTimestamp(),
                });
                console.log("UserService: User created successfully in Firestore.");
            } else {
                // Update last login
                await setDoc(userRef, {
                    lastLogin: serverTimestamp()
                }, { merge: true });
                console.log("UserService: User updated successfully in Firestore.");
            }
        } catch (error) {
            console.error("UserService Error: Failed to save user to Firestore.", error);
            throw error;
        }
    },

    async getUser(userId: string): Promise<User | null> {
        try {
            const userRef = doc(db, "users", userId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                return userSnap.data() as User;
            }
            return null;
        } catch (error) {
            console.error("UserService Error: Failed to fetch user.", error);
            throw error;
        }
    }
};
