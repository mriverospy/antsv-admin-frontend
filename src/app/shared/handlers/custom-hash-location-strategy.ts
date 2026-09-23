import { APP_BASE_HREF, HashLocationStrategy, PlatformLocation } from '@angular/common';
import { Inject, Injectable, Optional } from '@angular/core';

@Injectable()
export class CustomHashLocationStrategy extends HashLocationStrategy {

    constructor(private platformLocation: PlatformLocation, @Optional() @Inject(APP_BASE_HREF) _baseHref?: string) {
        super(platformLocation, _baseHref);
    }

    path(includeHash: boolean = false): string {
        let path = this.platformLocation.hash;
        if (path == null) {
            path = '#';
        }
        // This if block is the only custom code in this class.
        // The rest is the same as the HashLocationStrategy.
        // https://github.com/angular/angular/blob/13.3.2/packages/common/src/location/hash_location_strategy.ts#L65
        if (location.pathname === '/redirect') {
            path = `#${location.pathname}/${location.search}`;
        }

        return path.length > 0 ? path.substring(1) : path;
    }
}