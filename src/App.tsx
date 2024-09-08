import React from 'react';
import { Route, Switch } from 'wouter';
import { MapLayout } from './shared/components/';

import { About, Home } from './pages'

export const App: React.FC = () => {
  return (
    <MapLayout>
      <Switch>
        <Route path="/about" component={About} />
        <Route path="/" component={Home} />
      </Switch>
    </MapLayout>
  );
};
