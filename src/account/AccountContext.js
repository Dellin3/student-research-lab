import { createContext, useContext } from 'react'
export const AccountContext = createContext({ status: 'loading', client: null, session: null, recovery: false, error: '' })
export function useAccount() { return useContext(AccountContext) }
