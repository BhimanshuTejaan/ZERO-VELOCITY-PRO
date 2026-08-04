import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const SOLE_ADMIN_EMAIL = 'bhimanshutejaan@gmail.com';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasActiveLicense, setHasActiveLicense] = useState(false);
  const [userLicenses, setUserLicenses] = useState([]);
  const [checkingLicense, setCheckingLicense] = useState(false);

  const isSoleAdmin = currentUser?.email?.toLowerCase() === SOLE_ADMIN_EMAIL;

  function loginWithGoogle() {
    return signInWithPopup(auth, googleProvider);
  }

  function logout() {
    setHasActiveLicense(false);
    setUserLicenses([]);
    return signOut(auth);
  }

  const fetchUserLicenses = async (user) => {
    if (!user) {
      setHasActiveLicense(false);
      setUserLicenses([]);
      return;
    }

    setCheckingLicense(true);
    try {
      const db = getFirestore();
      const licensesRef = collection(db, 'licenses');
      
      let q = query(licensesRef, where('firebaseUid', '==', user.uid));
      let snap = await getDocs(q);

      let list = [];
      snap.forEach(doc => list.push(doc.data()));

      if (list.length === 0 && user.email) {
        let qEmail = query(licensesRef, where('email', '==', user.email));
        let snapEmail = await getDocs(qEmail);
        snapEmail.forEach(doc => list.push(doc.data()));
      }

      const activeList = list.filter(l => (l.status || 'active') === 'active');
      setUserLicenses(list);
      setHasActiveLicense(activeList.length > 0);
    } catch (err) {
      console.error("❌ Error checking user license ownership:", err);
    } finally {
      setCheckingLicense(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false);
      fetchUserLicenses(user);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleLicenseIssued = () => {
      if (currentUser) {
        fetchUserLicenses(currentUser);
      }
    };

    window.addEventListener('zero-velocity-license-issued', handleLicenseIssued);
    return () => window.removeEventListener('zero-velocity-license-issued', handleLicenseIssued);
  }, [currentUser]);

  const value = {
    currentUser,
    isSoleAdmin,
    hasActiveLicense,
    userLicenses,
    checkingLicense,
    refreshLicenseStatus: () => fetchUserLicenses(currentUser),
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

