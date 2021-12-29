import { BannerColorService } from './../../services/banner-color.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, from, of, pipe, Subscription } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

import { Role } from 'src/app/auth/models/user.model';
import { AuthService } from './../../../auth/services/auth.service';

type validFileExtension = 'png' | 'jpg';
type validMimeType = 'image/png' | 'image/jpeg';

type BannerColors = {
  colorOne: string;
  colorTwo: string;
  colorThree: string;
};
@Component({
  selector: 'app-profile-summary',
  templateUrl: './profile-summary.component.html',
  styleUrls: ['./profile-summary.component.scss'],
})
export class ProfileSummaryComponent implements OnInit, OnDestroy {
  form: FormGroup;

  validFileExtensions: validFileExtension[] = ['png', 'jpg'];
  validMimeTypes: validMimeType[] = ['image/png', 'image/jpeg'];

  userFullImagePath: string;
  private userImagePathSubscription: Subscription;

  fullName$ = new BehaviorSubject<string>(null);
  fullName = '';

  

  constructor(private authService: AuthService, public bannerColorService: BannerColorService) {}

  ngOnInit() {
    this.form = new FormGroup({
      file: new FormControl(null),
    });

    this.authService.userRole.pipe(take(1)).subscribe((role: Role) => {
      this.bannerColorService.bannerColors = this.bannerColorService.getBannerColors(role);
    });

    this.authService.userFullName
      .pipe(take(1))
      .subscribe((fullName: string) => {
        this.fullName = fullName;
        this.fullName$.next(fullName);
      });

    this.userImagePathSubscription = this.authService.userFullImagePath.subscribe(
      (fullImagePath: string) => {
        console.log(1, fullImagePath);
        this.userFullImagePath = fullImagePath
      }
    );
  }

 

  onFileSelect(event: Event): void {
    const file: File = (event.target as HTMLInputElement).files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    this.authService.uploadUserImage(formData).subscribe();

    this.form.reset();

    // from(file.arrayBuffer())
    //   .pipe(
    //     switchMap((buffer: Buffer) => {
    //       return from(fileTypeFromBuffer(buffer)).pipe(
    //         switchMap((fileTypeResult: FileTypeResult) => {
    //           if (!fileTypeResult) {
    //             // TODO: error handling
    //             console.log({ error: 'file format not supported!' });
    //             return of();
    //           }
    //           const { ext, mime } = fileTypeResult;
    //           const isFileTypeLegit = this.validFileExtensions.includes(
    //             ext as any
    //           );
    //           const isMimeTypeLegit = this.validMimeTypes.includes(mime as any);
    //           const isFileLegit = isFileTypeLegit && isMimeTypeLegit;
    //           if (!isFileLegit) {
    //             // TODO: error handling
    //             console.log({
    //               error: 'file format does not match file extension!',
    //             });
    //             return of();
    //           }
    //           return this.authService.uploadUserImage(formData);
    //         })
    //       );
    //     })
    //   )
    //   .subscribe();

    // this.form.reset();
  }

  ngOnDestroy() {
    this.userImagePathSubscription.unsubscribe();
  }
}
