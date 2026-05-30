import {NavLink} from 'react-router-dom';
import {ScrollText, ListChecks} from 'lucide-react';

const tabs = [
    {to: '/letter-53', label: 'نامه ۵۳', sub: 'Letter 53', icon: ScrollText},
    {to: '/letter-53-vocabulary', label: 'واژگان تخصصی', sub: 'Vocabulary (300)', icon: ListChecks}
];

export function IslamicTextsNav() {
    return (
        <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                    <NavLink
                        key={tab.to}
                        to={tab.to}
                        className={({isActive}) =>
                            `flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                                isActive
                                    ? 'bg-emerald-500/15 border-emerald-500/40 text-white'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                            }`
                        }
                    >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="text-sm font-medium" style={{fontFamily: 'Vazirmatn, sans-serif'}}>
                            {tab.label}
                        </span>
                        <span className="text-xs text-gray-500">{tab.sub}</span>
                    </NavLink>
                );
            })}
        </div>
    );
}
