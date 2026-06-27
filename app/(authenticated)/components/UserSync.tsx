'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useGetCurrentUserQuery } from '@/config/redux/api/authApi';
import { updateUserRole } from '@/config/redux/slices/authSlice';

export function UserSync() {
  const { data } = useGetCurrentUserQuery();
  const dispatch = useDispatch();

  useEffect(() => {
    if (data) {
      dispatch(updateUserRole(data.userType));
    }
  }, [data, dispatch]);

  return null;
}
