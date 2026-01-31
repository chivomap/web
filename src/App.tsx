import React from 'react';
import { Route, Switch } from 'wouter';
import { MapLayout } from './shared/components/';
import { ErrorNotification } from './shared/components/ErrorNotification';
import { ProjectInfo } from './shared/components/Map/Features/ProjectInfo';
import { useAnalytics } from './hooks/useAnalytics';

import { About, Home, Export, Account } from './pages'

export const App: React.FC = () => {
  useAnalytics();

  return (
    <>
      <MapLayout>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/export" component={Export} />
          <Route path="/account" component={Account} />
        </Switch>
      </MapLayout>
      <ErrorNotification />
      <ProjectInfo />
    </>
  );
};
