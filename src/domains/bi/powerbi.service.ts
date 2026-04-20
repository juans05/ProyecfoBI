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
   * Obtiene el Token de Acceso usando Usuario Maestro (ROPC).
   * Necesario para licencias PRO cuando no hay capacidad Premium.
   */
  private static async getAccessToken(): Promise<string> {
    const now = Date.now();
    // 1. Verificar caché (margen de 5 minutos)
    if (this.accessToken && this.tokenExpiration && now < this.tokenExpiration - 300000) {
      console.log("[PowerBIService] Usando Token de acceso de la caché");
      return this.accessToken;
    }

    try {
      console.log(`[MSAL] Solicitando token mediante Usuario Maestro: ${this.username}`);
      
      const clientApp = this.clientApp;
      
      // El flujo de Usuario Maestro usa acquireTokenByUsernamePassword
      const authResponse = await clientApp.acquireTokenByUsernamePassword({
        scopes: ["https://analysis.windows.net/powerbi/api/.default"],
        username: this.username,
        password: this.password,
      });

      if (!authResponse || !authResponse.accessToken) {
        throw new Error("No se pudo obtener el token de acceso de Microsoft");
      }

      // Guardar en caché
      this.accessToken = authResponse.accessToken;
      if (authResponse.expiresOn) {
        this.tokenExpiration = authResponse.expiresOn.getTime();
      }

      console.log("[MSAL] Token obtenido con éxito mediante Usuario Maestro");
      return authResponse.accessToken;
    } catch (error: any) {
      console.error("[MSAL Diagnostics] Error detallado de Microsoft:", error.errorMessage || error.message);
      
      if (error.message.includes("AADSTS65001")) {
        throw new Error("Falta el consentimiento de administrador. Daniel debe pulsar 'Grant admin consent' en el portal de aplicaciones.");
      }
      
      if (error.message.includes("MFA") || error.message.includes("AADSTS50076")) {
        throw new Error("MFA_REQUIRED: La cuenta tiene activo el Doble Factor (MFA). El administrador debe desactivar MFA para esta cuenta o crear una política de exclusión.");
      }

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
