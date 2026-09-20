export function resetPasswordTemplate(link: string): string{
    return `
    <h3>Recuperación de contraseña</h3>
    <p>Presiona el botón de abajo</p>
    <a href="${link}">${link}</a>
    <p>Expira en 20 minutos</p>
    `
}