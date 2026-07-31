// Mock Supabase client — frontend-only mode, no backend required
const noop = () => Promise.resolve({ data: null, error: null });
const chainable = {
  select: () => chainable,
  eq: () => chainable,
  order: () => chainable,
  limit: () => chainable,
  upsert: noop,
  insert: noop,
  update: () => chainable,
  delete: () => chainable,
  then: (fn) => Promise.resolve(fn({ data: null, error: null })),
  catch: () => chainable,
};

export const supabase = {
  from: () => chainable,
  auth: {
    getSession: () => Promise.resolve({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithOAuth: noop,
    signOut: noop,
  },
};
