'use client';

import { useEffect, useMemo, useState } from 'react';
import { collectionApi } from '@/lib/firestore/crud';

/**
 * Suscripción en tiempo real a una colección de Firestore.
 * `options` se reenvía a collectionApi (p.ej. { orderByField: 'nombres', direction: 'asc' }).
 */
export function useCollection(collectionName, options) {
  const api = useMemo(() => collectionApi(collectionName, options), [collectionName, JSON.stringify(options)]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = api.subscribe(
      (data) => {
        setItems(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [api]);

  return { items, loading, error, api };
}
