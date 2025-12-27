export function get_current_timestamp(): number {   
    const now = new Date();
    // get last 4 digits of timestamp
    return now.getTime() % 10000;
}

export function get_current_date_string(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}:${month}:${day} ${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;
}
