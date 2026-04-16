import * as msal from "@azure/msal-node"
import axios from "axios"

export class PowerBIService {
  private static clientId = process.env.PBI_CLIENT_ID!
  private static tenantId = process.env.PBI_TENANT_ID!
  private static clientSecret = process.env.PBI_CLIENT_SECRET!
  private static username = process.env.PBI_USERNAME!
  private static password = process.env.PBI_PASSWORD!

  private static _clientApp: msal.ConfidentialClientApplication | null = null

  /**
   * Obtiene la instancia de la aplicación de Microsoft (Singleton)
   */
  private static get clientApp() {
    if (!this._clientApp) {
      const msalConfig: msal.Configuration = {
        auth: {
          clientId: this.clientId,
          authority: `https://login.microsoftonline.com/${this.tenantId}`,
          clientSecret: this.clientSecret,
        }
      }
      this._clientApp = new msal.ConfidentialClientApplication(msalConfig)
    }
    return this._clientApp
  }

  private static accessToken: string | null = null
  private static tokenExpiration: number = 0

  /**
   * Obtiene el Token de Acceso usando Service Principal (Recomendado).
   */
  private static async getAccessToken(): Promise<string> {
    const now = Date.now();
    // 1. Verificar caché (margen de 5 minutos)
    if (this.accessToken && this.tokenExpiration && now < this.tokenExpiration - 300000) {
      console.log("[PowerBIService] Usando Token de acceso de la caché");
      return this.accessToken;
    }

    try {
      console.log("[MSAL] Solicitando token mediante Service Principal...");
      
      const clientApp = this.clientApp;
      
      // El flujo de Service Principal usa acquireTokenByClientCredential
      const authResponse = await clientApp.acquireTokenByClientCredential({
        scopes: ["https://analysis.windows.net/powerbi/api/.default"],
      });

      if (!authResponse || !authResponse.accessToken) {
        throw new Error("No se pudo obtener el token de acceso de Microsoft");
      }

      // Guardar en caché
      this.accessToken = authResponse.accessToken;
      if (authResponse.expiresOn) {
        this.tokenExpiration = authResponse.expiresOn.getTime();
      }

      console.log("[MSAL] Token obtenido con éxito mediante Service Principal");
      return authResponse.accessToken;
    } catch (error: any) {
      console.error("[MSAL Diagnostics] Error detallado de Microsoft:", error.errorMessage || error.message);
      throw new Error(`Error de autenticación: ${error.errorMessage || error.message}`);
    }
  }

  /**
   * Genera la configuración de embebido para un reporte
   */
  static async getEmbedConfig(workspaceId: string, reportId: string) {
    const accessToken = await this.getAccessToken()

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }

    try {
      const reportResponse = await axios.get(
        `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}`,
        { headers }
      )

      const embedUrl = reportResponse.data.embedUrl

      const tokenResponse = await axios.post(
        `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}/GenerateToken`,
        { accessLevel: "View" },
        { headers }
      )

      return {
        accessToken: tokenResponse.data.token,
        embedUrl: embedUrl,
        reportId: reportId,
        expiry: tokenResponse.data.expiration
      }
    } catch (error: any) {
      console.error("Error obteniendo Embed Config de Power BI:", error.response?.data || error.message)
      throw new Error("No se pudo generar el token de visualización del reporte")
    }
  }
}
