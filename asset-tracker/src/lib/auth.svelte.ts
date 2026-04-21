import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { clearUserCaches } from './cache';

let user = $state<User | null>(null);
let loading = $state(true);

supabase.auth.getSession().then(({ data: { session } }) => {
	user = session?.user ?? null;
	loading = false;
});

supabase.auth.onAuthStateChange((_event, session) => {
	user = session?.user ?? null;
	loading = false;
});

export function getAuth() {
	return {
		get user() {
			return user;
		},
		get loading() {
			return loading;
		}
	};
}

export async function signOut() {
	if (user?.id) {
		clearUserCaches(user.id);
	}
	await supabase.auth.signOut();
}
