import type { AlertasTrabajo } from "@/interfaces/alertasTrabajo.interface";
import { api } from "@/lib/api";
import sessionManager from "@/lib/session";

// Base API URL from environment variables
const apiUrl = api.baseUrl;

// Tomamos el usuario actual de la sesión activa
const { user } = await sessionManager.getUserFromSupabase();

/**
 * Servicio para manejar las operaciones relacionadas con las alertas de trabajo
 */
export class AlertasTrabajoService {

    constructor() { }

    /**
     * Obtiene TODAS las notificaciones/alertas de trabajo del candidato
     */
    public static async fetchAllAlerts(): Promise<AlertasTrabajo> {
        try {
            if (!user || !user.id) {
                return {
                    success: false,
                    data: [],
                    message: 'No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente.'
                };
            }

            const response = await fetch(`${apiUrl}/candidate/perfiles/notificaciones/${user.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    data: [],
                    message: data.message || `Error ${response.status}: ${response.statusText}`
                };
            }

            return data as AlertasTrabajo;
        } catch (error) {
            console.error('Error fetching alerts:', error);
            return {
                success: false,
                data: [],
                message: error instanceof Error ? error.message : 'Error desconocido al cargar las alertas'
            };
        }
    }

    /**
     * Filtra las alertas por estado de lectura
     */
    public static filterByReadStatus(alerts: any[], status: string): any[] {
        if (status === 'all') return alerts;
        if (status === 'unread') return alerts.filter(alert => !alert.leido);
        if (status === 'read') return alerts.filter(alert => alert.leido);
        return alerts;
    }

    /**
     * Filtra las alertas por tipo
     */
    public static filterByType(alerts: any[], type: string): any[] {
        if (type === 'all') return alerts;
        return alerts.filter(alert => alert.tipo.toLowerCase() === type.toLowerCase());
    }

    /**
     * Ordena las alertas por fecha (más recientes primero)
     */
    public static sortByDate(alerts: any[], descending: boolean = true): any[] {
        return [...alerts].sort((a, b) => {
            const dateA = new Date(a.enviado_en).getTime();
            const dateB = new Date(b.enviado_en).getTime();
            return descending ? dateB - dateA : dateA - dateB;
        });
    }

    /**
     * Cuenta las alertas no leídas
     */
    public static countUnreadAlerts(alerts: any[]): number {
        return alerts.filter(alert => !alert.leido).length;
    }

    /**
     * Cambia el estado de lectura de una notificación (toggle)
     */
    public static async toggleReadStatus(alertId: number, newReadStatus: boolean): Promise<{ success: boolean; message: string }> {
        try {
            const response = await fetch(`${apiUrl}/candidate/perfiles/notificaciones/${alertId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    leido: newReadStatus
                })
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || `Error ${response.status}: ${response.statusText}`
                };
            }

            return {
                success: true,
                message: newReadStatus ? 'Alerta marcada como leída' : 'Alerta marcada como no leída'
            };
        } catch (error) {
            console.error('Error toggling alert read status:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error desconocido al actualizar la alerta'
            };
        }
    }

    /**
     * Marca todas las alertas como leídas
     */
    public static async markAllAsRead(alertIds: number[]): Promise<{ success: boolean; message: string }> {
        try {
            // Realizar todas las peticiones en paralelo
            const promises = alertIds.map(alertId =>
                fetch(`${apiUrl}/candidate/perfiles/notificaciones/${alertId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        leido: true
                    })
                })
            );

            const results = await Promise.all(promises);

            // Verificar si todas las peticiones fueron exitosas
            const allSuccessful = results.every(response => response.ok);

            if (!allSuccessful) {
                return {
                    success: false,
                    message: 'Algunas alertas no pudieron ser marcadas como leídas'
                };
            }

            return {
                success: true,
                message: 'Todas las alertas han sido marcadas como leídas'
            };
        } catch (error) {
            console.error('Error marking all alerts as read:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error desconocido al marcar las alertas'
            };
        }
    }
}
