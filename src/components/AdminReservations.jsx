import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

function AdminReservations() {
    const [rsvps, setRsvps] = useState([]);
    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorConfig, setErrorConfig] = useState(false);
    
    const [activeTab, setActiveTab] = useState('rsvps');

    // Form state for new guest
    const [newGuestName, setNewGuestName] = useState('');
    const [newGuestPhone, setNewGuestPhone] = useState('');
    const [newGuestPasses, setNewGuestPasses] = useState('');

    useEffect(() => {
        try {
            // Escuchar RSVP
            const qRsvps = query(collection(db, "rsvps"), orderBy("timestamp", "desc"));
            const unsubscribeRsvps = onSnapshot(qRsvps, (querySnapshot) => {
                const data = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    dateStr: doc.data().timestamp ? doc.data().timestamp.toDate().toLocaleString() : 'N/A'
                }));
                setRsvps(data);
                setLoading(false);
            }, (err) => {
                console.error("Firebase error rsvps:", err);
                setErrorConfig(true);
                setLoading(false);
            });

            // Escuchar Master Guest List
            const qGuests = query(collection(db, "guests")); // we can sort later in memory
            const unsubscribeGuests = onSnapshot(qGuests, (querySnapshot) => {
                const data = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setGuests(data);
            }, (err) => {
                console.error("Firebase error guests:", err);
            });

            return () => {
                unsubscribeRsvps();
                unsubscribeGuests();
            };
        } catch (err) {
            console.error("Initialization error:", err);
            setErrorConfig(true);
            setLoading(false);
        }
    }, []);

    const totalGuests = rsvps
        .filter(r => r.attending === 'Sí, asistiré')
        .reduce((acc, curr) => acc + (parseInt(curr.guestsCount) || 0), 0);

    const totalNotAttending = rsvps.filter(r => r.attending === 'No podré asistir').length;

    const handleDeleteRsvp = async (id, name) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar la confirmación de "${name}"?`)) {
            try {
                await deleteDoc(doc(db, "rsvps", id));
            } catch (error) {
                console.error("Error al eliminar el documento:", error);
                alert("Hubo un error al intentar eliminar la confirmación.");
            }
        }
    };

    const handleDeleteGuest = async (id, name) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar a "${name}" de la lista maestra?`)) {
            try {
                await deleteDoc(doc(db, "guests", id));
            } catch (error) {
                console.error("Error al eliminar el invitado:", error);
                alert("Hubo un error al intentar eliminar al invitado.");
            }
        }
    };

    const handleAddGuest = async (e) => {
        e.preventDefault();
        if (!newGuestName.trim() || !newGuestPhone.trim() || !newGuestPasses) return;
        
        try {
            await addDoc(collection(db, 'guests'), {
                name: newGuestName.trim(),
                phone: newGuestPhone.trim(),
                passes: parseInt(newGuestPasses),
                reminder7Sent: false,
                reminder15Sent: false,
                createdAt: serverTimestamp()
            });
            setNewGuestName('');
            setNewGuestPhone('');
            setNewGuestPasses('');
            alert("Invitado agregado exitosamente");
        } catch (error) {
            console.error("Error agregando invitado:", error);
            alert("Error al agregar invitado.");
        }
    };

    const handleSendReminder = async (guest, type) => {
        let message = '';
        const origin = window.location.origin;
        const linkStr = `${origin}/?nombre=${encodeURIComponent(guest.name)}&pases=${guest.passes}`;
        
        if (type === '7') {
            message = `¡Hola ${guest.name}! 🌟 Esperamos que estés muy bien. Te escribimos para recordarte que se acerca el gran día de Samantha y nos encantaría contar contigo. Por favor confírmanos tu asistencia en tu invitación web antes del 25 de junio. Tu enlace: ${linkStr}`;
        } else if (type === '15') {
            message = `¡Hola ${guest.name}! 🌟 Este es un amable recordatorio final. Hoy es el último día para confirmar tu asistencia a los XV de Samantha. Por favor confirma aquí para asegurar tu lugar: ${linkStr} ¡Gracias! 👑`;
        }
        
        const cleanPhone = guest.phone.replace(/\D/g, '');
        const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
        
        // Update database
        try {
            await updateDoc(doc(db, "guests", guest.id), {
                [type === '7' ? 'reminder7Sent' : 'reminder15Sent']: true
            });
        } catch(e) {
            console.error("Error updating reminder status", e);
        }
    };

    // Calculate pending guests
    // Un invitado está pendiente si su nombre NO está en la lista de rsvps (ignorando mayúsculas)
    const pendingGuests = guests.filter(guest => {
        return !rsvps.some(rsvp => rsvp.name.toLowerCase().trim() === guest.name.toLowerCase().trim());
    });

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8 flex justify-between items-end border-b pb-4">
                    <div>
                        <h1 className="text-3xl font-serif text-secondary-blue">Panel de Confirmaciones</h1>
                        <p className="text-gray-500 mt-2">Gestión de invitados para los XV de Samantha</p>
                    </div>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="text-sm border border-secondary-blue text-secondary-blue px-4 py-2 rounded-full hover:bg-secondary-blue hover:text-white transition"
                    >
                        Ver Invitación
                    </button>
                </header>

                {errorConfig ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl mb-8">
                        <h3 className="font-bold text-lg mb-2">⚠️ Firebase no configurado</h3>
                        <p className="mb-4">Revisa tu configuración de Firebase.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-50 text-secondary-blue flex items-center justify-center text-xl">👥</div>
                                <div>
                                    <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Total Personas Conf.</p>
                                    <p className="text-3xl font-serif text-slate-800">{totalGuests}</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-xl">✅</div>
                                <div>
                                    <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Familias Conf.</p>
                                    <p className="text-3xl font-serif text-slate-800">{rsvps.filter(r => r.attending === 'Sí, asistiré').length}</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-xl">❌</div>
                                <div>
                                    <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">No asistirán</p>
                                    <p className="text-3xl font-serif text-slate-800">{totalNotAttending}</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center text-xl">⏳</div>
                                <div>
                                    <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Faltan por Conf.</p>
                                    <p className="text-3xl font-serif text-slate-800">{pendingGuests.length}</p>
                                </div>
                            </div>
                        </div>

                        {/* TABS */}
                        <div className="flex gap-4 mb-6 border-b border-gray-200">
                            <button 
                                onClick={() => setActiveTab('rsvps')}
                                className={`pb-3 px-4 text-sm font-bold uppercase tracking-wider transition ${activeTab === 'rsvps' ? 'border-b-2 border-secondary-blue text-secondary-blue' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Confirmaciones ({rsvps.length})
                            </button>
                            <button 
                                onClick={() => setActiveTab('pending')}
                                className={`pb-3 px-4 text-sm font-bold uppercase tracking-wider transition ${activeTab === 'pending' ? 'border-b-2 border-secondary-blue text-secondary-blue' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Lista Maestra y Pendientes ({pendingGuests.length})
                            </button>
                        </div>

                        {activeTab === 'rsvps' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100">
                                                <th className="py-4 px-6 text-sm font-bold text-gray-500 uppercase tracking-wider">Nombre</th>
                                                <th className="py-4 px-6 text-sm font-bold text-gray-500 uppercase tracking-wider">Asistencia</th>
                                                <th className="py-4 px-6 text-sm font-bold text-gray-500 uppercase tracking-wider">Pases</th>
                                                <th className="py-4 px-6 text-sm font-bold text-gray-500 uppercase tracking-wider">Teléfono & Mensaje</th>
                                                <th className="py-4 px-6 text-sm font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                                                <th className="py-4 px-6 text-sm font-bold text-gray-500 uppercase tracking-wider text-center">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {loading ? (
                                                <tr>
                                                    <td colSpan="6" className="py-10 text-center text-gray-400">Cargando datos...</td>
                                                </tr>
                                            ) : rsvps.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="py-10 text-center text-gray-400">Aún no hay confirmaciones registradas.</td>
                                                </tr>
                                            ) : (
                                                rsvps.map((rsvp) => (
                                                    <tr key={rsvp.id} className="hover:bg-gray-50 transition">
                                                        <td className="py-4 px-6 font-medium text-slate-800">{rsvp.name}</td>
                                                        <td className="py-4 px-6">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${rsvp.attending === 'Sí, asistiré' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                {rsvp.attending}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6 font-serif text-slate-600">
                                                            {rsvp.attending === 'Sí, asistiré' ? rsvp.guestsCount : '-'}
                                                        </td>
                                                        <td className="py-4 px-6 text-sm text-slate-600">
                                                            <div>{rsvp.phone}</div>
                                                            {rsvp.message && <div className="text-xs text-gray-400 italic mt-1 font-serif">"{rsvp.message}"</div>}
                                                        </td>
                                                        <td className="py-4 px-6 text-xs text-gray-400">
                                                            {rsvp.dateStr}
                                                        </td>
                                                        <td className="py-4 px-6 text-center">
                                                            <button
                                                                onClick={() => handleDeleteRsvp(rsvp.id, rsvp.name)}
                                                                className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-full transition"
                                                                title="Eliminar confirmación"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'pending' && (
                            <div className="space-y-6">
                                {/* Formulario para agregar invitado */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-serif text-secondary-blue mb-4">Agregar Nuevo Invitado</h3>
                                    <form onSubmit={handleAddGuest} className="flex flex-wrap gap-4 items-end">
                                        <div className="flex-1 min-w-[200px]">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nombre Exacto (como en la invitación)</label>
                                            <input type="text" value={newGuestName} onChange={e => setNewGuestName(e.target.value)} required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-secondary-blue/50" placeholder="Ej: Familia Pérez" />
                                        </div>
                                        <div className="flex-1 min-w-[150px]">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Teléfono (con código de país)</label>
                                            <input type="text" value={newGuestPhone} onChange={e => setNewGuestPhone(e.target.value)} required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-secondary-blue/50" placeholder="Ej: 50688888888" />
                                        </div>
                                        <div className="w-24">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Pases</label>
                                            <input type="number" min="1" value={newGuestPasses} onChange={e => setNewGuestPasses(e.target.value)} required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-secondary-blue/50" placeholder="Ej: 2" />
                                        </div>
                                        <button type="submit" className="px-6 py-2 bg-secondary-blue text-white rounded-lg hover:bg-slate-700 transition font-bold text-sm h-[42px]">
                                            Agregar
                                        </button>
                                    </form>
                                </div>

                                {/* Lista de Pendientes */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-4 bg-gray-50 border-b border-gray-100">
                                        <h3 className="font-bold text-gray-700">Invitados Pendientes de Confirmar ({pendingGuests.length})</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-white border-b border-gray-100">
                                                    <th className="py-4 px-6 text-sm font-bold text-gray-500 uppercase tracking-wider">Nombre</th>
                                                    <th className="py-4 px-6 text-sm font-bold text-gray-500 uppercase tracking-wider">Pases</th>
                                                    <th className="py-4 px-6 text-sm font-bold text-gray-500 uppercase tracking-wider">Teléfono</th>
                                                    <th className="py-4 px-6 text-sm font-bold text-gray-500 uppercase tracking-wider text-center">Recordatorios (WhatsApp)</th>
                                                    <th className="py-4 px-6 text-sm font-bold text-gray-500 uppercase tracking-wider text-center">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {pendingGuests.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5" className="py-10 text-center text-gray-400">Todos los invitados han confirmado o la lista está vacía.</td>
                                                    </tr>
                                                ) : (
                                                    pendingGuests.map((guest) => (
                                                        <tr key={guest.id} className="hover:bg-gray-50 transition">
                                                            <td className="py-4 px-6 font-medium text-slate-800">{guest.name}</td>
                                                            <td className="py-4 px-6 font-serif text-slate-600">{guest.passes}</td>
                                                            <td className="py-4 px-6 text-sm text-slate-600">{guest.phone}</td>
                                                            <td className="py-4 px-6">
                                                                <div className="flex gap-2 justify-center">
                                                                    <button 
                                                                        onClick={() => handleSendReminder(guest, '7')}
                                                                        className={`px-3 py-1 text-xs rounded-full border transition ${guest.reminder7Sent ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-blue-200 text-blue-600 hover:bg-blue-50'}`}
                                                                    >
                                                                        {guest.reminder7Sent ? '✓ Rec. 7 Jun Enviado' : 'Enviar Rec. 7 Jun'}
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleSendReminder(guest, '15')}
                                                                        className={`px-3 py-1 text-xs rounded-full border transition ${guest.reminder15Sent ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-red-200 text-red-600 hover:bg-red-50'}`}
                                                                    >
                                                                        {guest.reminder15Sent ? '✓ Rec. 25 Jun Enviado' : 'Enviar Rec. 25 Jun'}
                                                                    </button>
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-6 text-center">
                                                                <button
                                                                    onClick={() => handleDeleteGuest(guest.id, guest.name)}
                                                                    className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-full transition"
                                                                    title="Eliminar invitado"
                                                                >
                                                                    🗑️
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default AdminReservations;
