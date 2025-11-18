import { useState, useEffect } from 'react';
import { fetchUsers } from '../utils/apiService';

export function useKnownUsers() {
  const [knownUsers, setKnownUsers] = useState([]);
  const [knownUsersFetched, setKnownUsersFetched] = useState(false);

  useEffect(() => {
    (async () => {
      const users = await fetchUsers();
      setKnownUsers(users);
      setKnownUsersFetched(users.length > 0);
    })();
  }, []);

  return { knownUsers, knownUsersFetched };
}
