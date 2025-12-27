export function get_current_timestamp(): number {   
    const now = new Date();
    // get last 4 digits of timestamp
    return now.getTime() % 10000;
}