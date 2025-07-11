import React, { createContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const CustomNavigateContext = createContext();

export function CustomNavigateProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const inlineValue = params.has('inline') ? params.get('inline') : null;

  const customNavigate = (to, options) => {
    if (typeof to === 'string') {
      let [path, search = ''] = to.split('?');
      const newParams = new URLSearchParams(search);
      if (inlineValue !== null && !newParams.has('inline')) {
        if (inlineValue === '' || inlineValue === 'true' || inlineValue === null) {
          newParams.set('inline', '');
        } else {
          newParams.set('inline', inlineValue);
        }
      }
      const searchString = newParams.toString();
      to = searchString ? `${path}?${searchString}` : path;
    } else if (typeof to === 'object' && to.search !== undefined) {
      const newParams = new URLSearchParams(to.search);
      if (inlineValue !== null && !newParams.has('inline')) {
        if (inlineValue === '' || inlineValue === 'true' || inlineValue === null) {
          newParams.set('inline', '');
        } else {
          newParams.set('inline', inlineValue);
        }
      }
      to = { ...to, search: newParams.toString() };
    }
    navigate(to, options);
  };

  return (
    <CustomNavigateContext.Provider value={customNavigate}>
      {children}
    </CustomNavigateContext.Provider>
  );
}

export { CustomNavigateContext }; 