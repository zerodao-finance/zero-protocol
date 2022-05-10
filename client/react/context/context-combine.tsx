import * as React from 'react';

export function combineComponents(...components: React.FC[]): React.FC {
  return components.reduce(
    (AccumulatedComponents, CurrentComponent) => {
      return ({ children }: React.ComponentProps<React.FC>): JSX.Element => {
        return (
          <AccumulatedComponents>
            <CurrentComponent>{children}</CurrentComponent>
          </AccumulatedComponents>
        );
      };
    },
    ({children}) => <>{children}</>
  );
};


