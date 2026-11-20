import { CoreProvider } from './CoreData';
import { FilterProvider, useFilters } from './FilterContext';
import { Footer, DisclaimerBar } from '../components/shell/Footer';
import { GlobalFilters } from '../components/shell/GlobalFilters';
import { Header } from '../components/shell/Header';
import { ForecastPage } from '../pages/ForecastPage';
import { HealthPage } from '../pages/HealthPage';
import { OverviewPage } from '../pages/OverviewPage';
import { PlanPage } from '../pages/PlanPage';
import { ReplenishmentPage } from '../pages/ReplenishmentPage';
import { ScorecardPage } from '../pages/ScorecardPage';

function Screen() {
  const { route } = useFilters();
  switch (route) {
    case 'scorecard': return <ScorecardPage />;
    case 'health': return <HealthPage />;
    case 'replenishment': return <ReplenishmentPage />;
    case 'forecast': return <ForecastPage />;
    case 'plan': return <PlanPage />;
    default: return <OverviewPage />;
  }
}

export function Shell() {
  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-30 focus:m-2 btn btn-primary">Skip to content</a>
      <Header />
      <main id="main" className="max-w-page w-full mx-auto px-4 md:px-8 py-6 grid gap-6 flex-1 content-start">
        <GlobalFilters />
        <DisclaimerBar />
        <Screen />
      </main>
      <Footer />
    </div>
  );
}

export function App() {
  return (
    <CoreProvider>
      <FilterProvider>
        <Shell />
      </FilterProvider>
    </CoreProvider>
  );
}
