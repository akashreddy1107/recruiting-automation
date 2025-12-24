import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function StatsCard({ title, value, icon: Icon, trend, color, delay = 0 }) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
            }}
            whileHover={{ y: -5 }}
            className="gemini-card group"
        >
            <div className="flex items-center justify-between mb-4">
                <div className={clsx("p-3 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors", color)}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <span className={clsx("text-sm font-medium px-2 py-1 rounded-lg bg-white/5", trend > 0 ? "text-green-400" : "text-red-400")}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <h3 className="text-secondary text-sm font-medium">{title}</h3>
            <p className="text-3xl font-bold text-primary mt-2 tracking-tight">{value}</p>
        </motion.div>
    );
}
