import { AnimatePresence, motion } from 'framer-motion'
import { useTrip } from '../store'

// Nic's lock screen: where Ari's settle-up request lands after the phone flip.
export default function NicLock() {
  const push = useTrip((s) => s.push)
  const openPush = useTrip((s) => s.openPush)
  return (
    <div className="absolute inset-0 bg-[linear-gradient(160deg,#e9e4ff_0%,#ffd9e4_55%,#ffe7d1_100%)]">
      <div className="flex flex-col items-center" style={{ paddingTop: 'calc(var(--safe-top) + 40px)' }}>
        <div className="text-sub font-semibold text-label/70">Saturday 18 October</div>
        <div className="text-[84px] font-bold leading-none tracking-tight text-label/85">9:41</div>
      </div>
      <div className="mt-10 px-3">
        <AnimatePresence>
          {push && (
            <motion.button
              initial={{ y: -40, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              whileTap={{ scale: 0.98 }}
              onClick={openPush}
              className="block w-full rounded-[24px] bg-white/75 p-3 text-left shadow-lg ring-1 ring-black/5 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-blue text-foot font-bold text-white">TU</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-foot font-semibold">{push.title}</span>
                    <span className="text-cap text-label-2">now</span>
                  </div>
                  <div className="text-foot">{push.body}</div>
                </div>
              </div>
            </motion.button>
          )}
        </AnimatePresence>
        {push && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-3 text-center text-foot font-semibold text-label/60">
            Tap the notification to pay
          </motion.div>
        )}
      </div>
    </div>
  )
}
