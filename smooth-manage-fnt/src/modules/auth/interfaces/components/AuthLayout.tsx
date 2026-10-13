import { BrandPanel } from './BrandPanel';
import { AuthView } from './AuthView';
import { Icon } from './ui/Icon';

export function AuthLayout() {
  return (
    <div className="wrap">
      <BrandPanel />
      <main className="side">
        <div className="card">
          <div className="lg mlogo">
            <Icon name="proj" size={24} className="text-teal-500" />
            <span className="font-bold text-xl">SmoothManage</span>
          </div>
          <AuthView />
        </div>
      </main>
    </div>
  );
}