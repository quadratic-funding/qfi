import React from "react";
import {
  useCallback,
  useState,
  createContext,
  useMemo,
  RefObject,
  useEffect,
  useRef,
  useLayoutEffect,
  useContext,
} from "react";
import { WalletProvider, web3modalOptions, SUPPORTED_NETWORKS, nameToChainId } from "@qfi/hooks";
import { DappContextType, DappStateType, SetValue, Props } from "./types";

const initialDappState: DappStateType = {
  address: "0x0000000000000000000000000000000000000000",
};

const DappContext = createContext<DappContextType>({
  state: {} as DappStateType,
  setState: () => {},
  maciKey: "",
  setMaciKey: () => {},
});

export const DappProvider: React.FC<Props> = ({ children }) => {
  const [state, setState] = useLocalStorage<DappStateType>("data", initialDappState);
  const [maciKey, setMaciKey] = useLocalStorage<string>("maciKey", "");

  const contextValue = useMemo(
    () => ({
      state,
      setState,
      maciKey,
      setMaciKey,
    }),
    [state, setState, maciKey, setMaciKey]
  );

  useEffect(() => {
    // set initial state if need async calls
    // setState({});
  }, []);

  return (
    <DappContext.Provider value={contextValue}>
      <WalletProvider
        web3modalOptions={web3modalOptions}
        networks={SUPPORTED_NETWORKS}
        defaultChainId={nameToChainId("Gnosis Chain")}
        handleAccountsChangedEvent={(accounts: string[]) => {
          console.log("Accounts changed");
        }}
        handleChainChangedEvent={(chainId: number) => {
          console.log("ChainId changed to: " + chainId);
        }}
        handleConnectEvent={(info: { chainId: number }) => {
          console.log(info);
        }}
        handleDisconnectEvent={(error: { code: number; message: string }) => {
          if (error) console.log(error);
          else console.log("Disconnected");
        }}
        handleErrorEvent={(error: { code: string; message: string }) => {
          console.log("Error", error);
        }}>
        {children}
      </WalletProvider>
    </DappContext.Provider>
  );
};

export const useDappState = (): DappContextType => useContext(DappContext);

export function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
  // Get from local storage then
  // parse stored json or return initialValue
  const readValue = useCallback((): T => {
    // Prevent build error "window is undefined" but keep keep working
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (parseJSON(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue: SetValue<T> = useCallback(
    (value) => {
      // Prevent build error "window is undefined" but keeps working
      if (typeof window == "undefined") {
        console.warn(`Tried setting localStorage key “${key}” even though environment is not a client`);
      }

      try {
        // Allow value to be a function so we have the same API as useState
        const newValue = value instanceof Function ? value(storedValue) : value;

        // Save to local storage
        window.localStorage.setItem(key, JSON.stringify(newValue));

        // Save state
        setStoredValue(newValue);

        // We dispatch a custom event so every useLocalStorage hook are notified
        window.dispatchEvent(new Event("local-storage"));
      } catch (error) {
        console.warn(`Error setting localStorage key “${key}”:`, error);
      }
    },
    [key, storedValue]
  );

  useEffect(() => {
    setStoredValue(readValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStorageChange = useCallback(() => {
    setStoredValue(readValue());
  }, [readValue]);

  // this only works for other documents, not the current one
  useEventListener("storage", handleStorageChange);

  // this is a custom event, triggered in writeValueToLocalStorage
  // See: useLocalStorage()
  useEventListener("local-storage", handleStorageChange);

  return [storedValue, setValue];
}

// A wrapper for "JSON.parse()"" to support "undefined" value
function parseJSON<T>(value: string | null): T | undefined {
  try {
    return value === "undefined" ? undefined : JSON.parse(value ?? "");
  } catch {
    console.log("parsing error on", { value });
    return undefined;
  }
}

function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void
): void;
function useEventListener<K extends keyof HTMLElementEventMap, T extends HTMLElement = HTMLDivElement>(
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  element: RefObject<T>
): void;

function useEventListener<
  KW extends keyof WindowEventMap,
  KH extends keyof HTMLElementEventMap,
  T extends HTMLElement | void = void
>(
  eventName: KW | KH,
  handler: (event: WindowEventMap[KW] | HTMLElementEventMap[KH] | Event) => void,
  element?: RefObject<T>
) {
  // Create a ref that stores handler
  const savedHandler = useRef(handler);

  useIsomorphicLayoutEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    // Define the listening target
    const targetElement: T | Window = element?.current || window;
    if (!(targetElement && targetElement.addEventListener)) {
      return;
    }

    // Create event listener that calls handler function stored in ref
    const eventListener: typeof handler = (event) => savedHandler.current(event);

    targetElement.addEventListener(eventName, eventListener);

    // Remove event listener on cleanup
    return () => {
      targetElement.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
}

export const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// The MIT License (MIT)

// Copyright (c) 2020 Julien CARON, RaidGuild, RadHaus

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
