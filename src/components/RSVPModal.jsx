import React, { useState, useEffect } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

function RSVPModal({ isOpen, onClose, guestName, guestPasses }) {
    const [formData, setFormData] = useState({
        name: guestName || '',
        attending: 'Sí, asistiré',
        guestsCount: guestPasses || '1',
        phone: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            name: guestName || prev.name,
            guestsCount: guestPasses || prev.guestsCount
        }));
    }, [guestName, guestPasses]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg('');

        try {
            // Guardar en Firebase
            await addDoc(collection(db, "rsvps"), {
                ...formData,
                timestamp: new Date()
            });

            setIsSuccess(true);

            // Opcional: También enviar el mensaje por WhatsApp como backup
            // DESACTIVADO TEMPORALMENTE SEGÚN SOLICITUD
            // const waText = `¡Hola! Confirmo mi asistencia al baile de Samantha.%0A*Nombre:* ${formData.name}%0A*Acompañantes:* ${formData.guestsCount}`;
            // window.open(`https://wa.me/50683816071?text=${waText}`, '_blank');

            setTimeout(() => {
                onClose();
                setIsSuccess(false);
                setFormData({ name: '', attending: 'Sí, asistiré', guestsCount: '1', phone: '', message: '' });
            }, 3000);

        } catch (error) {
            console.error("Error adding document: ", error);
            setErrorMsg("Hubo un error al guardar tu confirmación. Verifica la conexión o inténtalo por WhatsApp directamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
            <div className="bg-white/95 rounded-2xl shadow-2xl w-full max-w-md p-6 relative overflow-hidden border border-white/40">

                {/* Background decorations */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary-blue/10 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-300/20 rounded-full blur-2xl"></div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5"
                >
                    ✕
                </button>

                {isSuccess ? (
                    <div className="text-center py-10 relative z-10">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">✓</span>
                        </div>
                        <h3 className="serif-font text-2xl text-secondary-blue mb-2">¡Confirmación Exitosa!</h3>
                        <p className="text-gray-500 italic">Te esperamos para celebrar esta noche mágica.</p>
                    </div>
                ) : (
                    <div className="relative z-10">
                        <h2 className="serif-font text-2xl text-center text-secondary-blue mb-6 drop-shadow-sm">Confirmación de Asistencia</h2>

                        {errorMsg && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center border border-red-100">
                                {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-600 font-medium mb-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    disabled={!!guestName}
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-secondary-blue/50 ${guestName ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white/50'}`}
                                    placeholder="Ej: Familia Pérez González"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 font-medium mb-1">Asistencia</label>
                                    <select
                                        name="attending"
                                        value={formData.attending}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-secondary-blue/50 bg-white/50"
                                    >
                                        <option value="Sí, asistiré">Sí, asistiré</option>
                                        <option value="No podré asistir">No podré asistir</option>
                                    </select>
                                </div>

                                {formData.attending === 'Sí, asistiré' && (
                                    <div>
                                        <label className="block text-sm text-gray-600 font-medium mb-1">Pases a utilizar {guestPasses ? `(Max: ${guestPasses})` : ''}</label>
                                        <input
                                            type="number"
                                            name="guestsCount"
                                            min="1"
                                            max={guestPasses ? parseInt(guestPasses) : 10}
                                            value={formData.guestsCount}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                const maxVal = guestPasses ? parseInt(guestPasses) : 10;
                                                if (val > maxVal) {
                                                    setFormData({ ...formData, guestsCount: maxVal.toString() });
                                                } else {
                                                    handleChange(e);
                                                }
                                            }}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-secondary-blue/50 bg-white/50"
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 font-medium mb-1">Teléfono</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-secondary-blue/50 bg-white/50"
                                    placeholder="Número de contacto"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 font-medium mb-1">Mensaje para Samantha <span className="text-gray-400 font-normal">(Opcional)</span></label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-secondary-blue/50 bg-white/50 resize-none"
                                    placeholder="Déjale un lindo mensaje..."
                                ></textarea>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3 bg-secondary-blue hover:bg-slate-700 text-white font-serif uppercase tracking-widest text-sm rounded-full transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        'Enviando...'
                                    ) : (
                                        <>
                                            <span>Enviar Confirmación</span>
                                            <span className="text-lg">✉</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RSVPModal;
