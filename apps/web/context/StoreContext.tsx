"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@apollo/client/react";
import { gql } from "@/gql";
import * as GQL from "@/gql/graphql";
import { toast } from "sonner";
import Loading from "@/components/Loading";

export interface StoreContextType {
  activeStoreId: string | null;
  stores: GQL.Store[];
  isLoading: boolean;
  currentStore: GQL.Store | null;
  switchStore: (id: string) => Promise<boolean>;
  hasStores: boolean;
}

interface StoreProviderProps {
  children: ReactNode;
  onStoreSwitchSuccess?: (storeId: string) => void;
  onStoreSwitchError?: (error: Error) => void;
}

const GET_STORES = gql(`
  query GetStores {
    getStores {
      success
      message
      data {
        id
        name
      }
    }
  }
`);

const StoreContext = createContext<StoreContextType | undefined>(undefined);
StoreContext.displayName = "StoreContext";

export function StoreProvider({
  children,
  onStoreSwitchSuccess,
  onStoreSwitchError,
}: StoreProviderProps) {
  const { data: session, update: updateSession, status: sessionStatus } = useSession();
  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);
  const [initializationComplete, setInitializationComplete] = useState(false);

  const {
    data,
    loading: isLoadingStores,
    error: graphqlError,
  } = useQuery<GQL.GetStoresQuery>(GET_STORES, {
    skip: sessionStatus !== "authenticated",
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });

  const stores = useMemo<GQL.Store[]>(() => {
    if (!data?.getStores?.success || !Array.isArray(data.getStores.data)) {
      return [] as GQL.Store[];
    }
    return data.getStores.data.filter((store): store is GQL.Store =>
      store !== null && store.id != null
    );
  }, [data]);

  const currentStore = useMemo<GQL.Store | null>(() => {
    if (!activeStoreId || stores.length === 0) return null;

    const store = stores.find((s) => s.id === activeStoreId);

    if (!store && activeStoreId) {
      console.warn(`[StoreProvider] Store ${activeStoreId} not found in available stores`);
      return null;
    }

    return store || null;
  }, [activeStoreId, stores]);

  useEffect(() => {
    if (initializationComplete) return;
    if (sessionStatus !== "authenticated") return;
    if (isLoadingStores) return;

    const initializeStore = () => {
      if (session?.user?.storeId) {
        const isValid = stores.some((s) => s.id === session.user?.storeId);
        if (isValid) {
          setActiveStoreId(session.user.storeId);
          setInitializationComplete(true);
          return;
        }
        // console.warn(`[StoreProvider] Session store ${session.user.storeId} not found in user's stores`);
        toast.warning(`Session store ${session.user.storeId} not found in user's stores`)
      }

      if (stores.length > 0) {
        const firstStoreId = stores[0]!.id;
        setActiveStoreId(firstStoreId);
        updateSession({ storeId: firstStoreId }).catch((err) => {
          toast.error("Failed to update session with default store");
        });
      }

      setInitializationComplete(true);
    };

    initializeStore();
  }, [
    sessionStatus,
    session?.user?.storeId,
    stores,
    isLoadingStores,
    updateSession,
    initializationComplete,
  ]);

  const switchStore = useCallback(
    async (storeId: string): Promise<boolean> => {
      const targetStore = stores.find((s) => s.id === storeId);

      if (!targetStore) {
        const error = new Error(`Store ${storeId} not found or not accessible`);
        toast.error("Invalid store switch attempt");
        onStoreSwitchError?.(error);
        return false;
      }
      try {
        setActiveStoreId(storeId);

        await updateSession({ storeId });

        onStoreSwitchSuccess?.(storeId);
        // await refetch();

        return true;
      } catch (error) {
        toast.error("Failed to switch store");
        setActiveStoreId((prev) => prev);

        onStoreSwitchError?.(
          error instanceof Error ? error : new Error("Failed to switch store")
        );

        return false;
      }
    },
    [stores, updateSession, onStoreSwitchSuccess, onStoreSwitchError]
  );

  const isLoading = useMemo(() => {
    return (
      sessionStatus === "loading" ||
      (sessionStatus === "authenticated" && isLoadingStores) ||
      !initializationComplete
    );
  }, [sessionStatus, isLoadingStores, initializationComplete]);

  const contextValue = useMemo<StoreContextType>(
    () => ({
      activeStoreId,
      stores,
      isLoading,
      error: graphqlError || null,
      currentStore,
      switchStore,
      hasStores: stores.length > 0,
    }),
    [
      activeStoreId,
      stores,
      isLoading,
      graphqlError,
      currentStore,
      switchStore,
    ]
  );

  if (sessionStatus === "loading") {
    return <Loading />;
  }

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextType {
  const context = useContext(StoreContext);

  if (context === undefined) {
    throw new Error(
      "useStore must be used within a StoreProvider. " +
      "Wrap your component tree with <StoreProvider>."
    );
  }

  return context;
}

export function useCurrentStore(fallbackStoreId?: string) {
  const { currentStore, switchStore, isLoading, hasStores } = useStore();

  const store = useMemo(() => {
    if (currentStore) return currentStore;
    if (fallbackStoreId) {
      return null;
    }
    return null;
  }, [currentStore, fallbackStoreId]);

  return {
    store,
    isLoading,
    hasStores,
    switchStore,
  };
}