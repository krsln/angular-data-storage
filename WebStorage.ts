// HTML Web Storage Objects
export enum StorageType {
  Local,
  Session,
  Cookie
}

export class WebStorage {
  /*
   window.localStorage - stores data with no expiration date
   window.sessionStorage - stores data for one session (data is lost when the browser tab is closed)


    sessionStorage.removeItem('key'); // Remove saved data from sessionStorage
    sessionStorage.clear(); // Remove all saved data from sessionStorage

   */
  static Set(storageType: StorageType, key: string, obj: any, expMin: number = 60): any {
    // In your login logic or whatever
    // const expires = new Date(year, month, day, hours, minutes, seconds, milliseconds);
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + expMin);
    const data = {
      ExpiresAt: Date.parse(expires.toString()),
      Data: obj
    };

    if (storageType === StorageType.Local) {
      localStorage.setItem(key, JSON.stringify(data));
    } else if (storageType === StorageType.Session) {
      sessionStorage.setItem(key, JSON.stringify(data));
    } else if (storageType === StorageType.Cookie) {
      CookieMonster.Set(key, data, '/');
    }
    return this.Get(storageType, key);
  }

  static Get(storageType: StorageType, key: string): any {
    if (storageType === StorageType.Local) {
      const data = localStorage.getItem(key);
      if (data !== 'undefined' && data !== undefined && data !== null) {
        return this.CheckData(storageType, key, data);
      }
      return null;
    } else if (storageType === StorageType.Session) {
      const data = sessionStorage.getItem(key);
      if (data !== 'undefined' && data !== undefined && data !== null) {
        return this.CheckData(storageType, key, data);
      }
      return null;
    } else if (storageType === StorageType.Cookie) {
      const data = CookieMonster.Get(key);
      if (data !== 'undefined' && data !== undefined && data !== null) {
        return this.CheckData(storageType, key, data);
      }
      return null;
    }
  }

  static Remove(storageType: StorageType, key: string) {
    if (storageType === StorageType.Local) {
      localStorage.removeItem(key);
      console.log(key, 'localStorage expired');
    } else if (storageType === StorageType.Session) {
      sessionStorage.removeItem(key);
      console.log(key, 'session expired');
    } else if (storageType === StorageType.Cookie) {
      CookieMonster.Remove(key);
      console.log(key, ' Cookie expired');
    }
  }

  private static CheckData(storageType: StorageType, key: string, obj: any) {
    const sessionObject = JSON.parse(obj);
    // console.log(key, sessionObject, new Date(sessionObject.ExpiresAt));
    if (Date.parse(new Date().toString()) < sessionObject.ExpiresAt) {
      // normal application behaviour => session is not expired
      return sessionObject.Data;
    } else {
      // remove the sessionStorage because it will be set again by previous logic
      this.Remove(storageType, key);
      return null;
    }
  }
}

export class CookieMonster {
  static Get(name: string) {
    const cookies: Array<string> = document.cookie.split(';');
    const cookieName = `${name}=`;

    const data = cookies
      .map(x => x.replace(/^\s+/g, ''))
      .find(x => x.indexOf(cookieName) === 0);

    if (data) {
      return data.substring(cookieName.length, data.length);
    } else {
      return '';
    }
  }

  static Set(name: string, value: any, path: string = '') {
    const expires: string = 'expires=' + new Date(value.ExpiresAt).toUTCString();
    document.cookie = name + '=' + JSON.stringify(value) + '; ' + expires + (path.length > 0 ? '; path=' + path : '');
  }

  static Remove(name) {
    this.SetCookie(name, '', -1);
  }

  static SetCookie(name: string, value: string, expireDays: number, path: string = '') {
    const d: Date = new Date();
    d.setTime(d.getTime() + expireDays * 24 * 60 * 60 * 1000);
    const expires: string = 'expires=' + d.toUTCString();
    document.cookie = name + '=' + value + '; ' + expires + (path.length > 0 ? '; path=' + path : '');
  }
}