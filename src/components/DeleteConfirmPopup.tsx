import React from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, AlertTriangle, X } from "lucide-react";

interface DeleteConfirmPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  isLoading?: boolean;
}

export function DeleteConfirmPopup({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Entry?",
  description = "This action cannot be undone. This will permanently remove the log from your history.",
  isLoading = false
}: DeleteConfirmPopupProps) {
  return (
    <AlertDialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <AlertDialog.Portal forceMount>
            {/* Backdrop */}
            <AlertDialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100]"
              />
            </AlertDialog.Overlay>

            {/* Content */}
            <AlertDialog.Content asChild>
              <div className="fixed inset-0 flex items-center justify-center z-[101] p-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(239,68,68,0.1)]"
                >
                  <div className="relative p-8 text-center">
                    {/* Header Icon */}
                    <div className="mx-auto w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 relative">
                      <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping opacity-20" />
                      <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center">
                        <Trash2 className="w-7 h-7 text-red-500" />
                      </div>
                    </div>

                    <AlertDialog.Title className="text-2xl font-black text-white mb-3">
                      {title}
                    </AlertDialog.Title>
                    <AlertDialog.Description className="text-white/50 text-sm leading-relaxed mb-8">
                      {description}
                    </AlertDialog.Description>

                    <div className="flex flex-col gap-3">
                      <AlertDialog.Action asChild>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                          }}
                          disabled={isLoading}
                          className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-lg shadow-[0_8px_20px_rgba(239,68,68,0.3)] hover:shadow-[0_12px_25px_rgba(239,68,68,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              <Trash2 size={20} />
                              Delete Log
                            </>
                          )}
                        </button>
                      </AlertDialog.Action>

                      <AlertDialog.Cancel asChild>
                        <button
                          onClick={onClose}
                          disabled={isLoading}
                          className="w-full py-4 rounded-2xl bg-white/5 text-white/70 font-bold hover:bg-white/10 transition-colors"
                        >
                          Keep it
                        </button>
                      </AlertDialog.Cancel>
                    </div>

                    {/* Close X */}
                    <button 
                      onClick={onClose}
                      className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </motion.div>
              </div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        )}
      </AnimatePresence>
    </AlertDialog.Root>
  );
}
