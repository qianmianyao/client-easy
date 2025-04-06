export function Logo({ className, ...props }: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg fill="currentColor" viewBox="0 0 113 22" {...props} className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.99906 0.5L6.57031 0.742752L0.570312 10.7428V11.2572L6.57031 21.2572L6.99906 21.5H18.9991L19.3526 20.6464L16.8526 18.1464L16.4991 18H9.27424L4.8409 11L9.27424 4H16.4991L16.8526 3.85355L19.3526 1.35355L18.9991 0.5H6.99906Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20.7927 4.21875L18.3657 6.64575L18.2969 7.2668L20.6605 10.9993L18.2969 14.7318L18.3657 15.3529L20.7927 17.7799L21.5751 17.6835L25.4311 11.2565V10.7421L21.5751 4.31507L20.7927 4.21875Z"
      />
      <path d="M41.0629 18.2529C40.0969 18.2529 39.1729 18.0779 38.2909 17.7279C37.4249 17.3884 36.6385 16.8736 35.9809 16.2159C35.3229 15.5579 34.7909 14.7529 34.3849 13.8009C33.9929 12.8349 33.7969 11.7569 33.7969 10.5669C33.7969 9.39086 33.9999 8.33386 34.4059 7.39586C34.8119 6.44386 35.3509 5.64586 36.0229 5.00186C36.6826 4.3518 37.4688 3.8443 38.3329 3.51086C39.2011 3.16351 40.1277 2.98531 41.0629 2.98586C41.8968 2.98056 42.7262 3.10816 43.5199 3.36386C44.2899 3.60186 44.9619 3.95186 45.5359 4.41386C46.1217 4.85944 46.6141 5.41603 46.9849 6.05186C47.3769 6.68186 47.6289 7.38186 47.7409 8.15186H44.8639C44.6556 7.37614 44.1795 6.69917 43.5199 6.24086C42.8479 5.75086 42.0289 5.50586 41.0629 5.50586C40.4749 5.50586 39.9219 5.62486 39.4039 5.86286C38.8808 6.1047 38.4154 6.45554 38.0389 6.89186C37.6609 7.32586 37.3599 7.85786 37.1359 8.48786C36.9259 9.10386 36.8209 9.79686 36.8209 10.5669C36.8209 11.3369 36.9329 12.0439 37.1569 12.6879C37.3809 13.3319 37.6819 13.8779 38.0599 14.3259C38.4379 14.7739 38.8859 15.1239 39.4039 15.3759C39.9205 15.6275 40.4882 15.7569 41.0629 15.7539C42.0289 15.7539 42.8409 15.5159 43.4989 15.0399C44.1569 14.5639 44.6189 13.9129 44.8849 13.0869H47.7619C47.6318 13.8444 47.3611 14.5709 46.9639 15.2289C46.5931 15.8647 46.1007 16.4213 45.5149 16.8669C44.9013 17.314 44.2209 17.6613 43.4989 17.8959C42.7099 18.1388 41.8884 18.2592 41.0629 18.2529ZM57.0079 18.0009V16.4259C56.6978 16.988 56.2308 17.4477 55.6639 17.7489C55.0759 18.0709 54.3839 18.2319 53.5849 18.2319C52.9173 18.2353 52.255 18.1142 51.6319 17.8749C51.0354 17.6267 50.4985 17.2544 50.0569 16.7829C49.6089 16.2929 49.2519 15.6909 48.9869 14.9769C48.7339 14.2489 48.6079 13.4159 48.6079 12.4779C48.6079 11.5819 48.7409 10.7839 49.0079 10.0839C49.2879 9.38386 49.6509 8.79586 50.0989 8.31986C50.5479 7.85254 51.0922 7.48728 51.6949 7.24886C52.3009 6.99881 52.9503 6.87038 53.6059 6.87086C54.3899 6.87086 55.0619 7.02486 55.6219 7.33286C56.1959 7.62686 56.6369 8.02586 56.9449 8.52986V7.12286H59.6549V18.0009H57.0079ZM54.1939 16.0059C54.9639 16.0059 55.6219 15.6979 56.1679 15.0819C56.7279 14.4519 57.0079 13.5839 57.0079 12.4779C57.0079 11.4279 56.7349 10.6019 56.1889 9.99986C55.6569 9.39786 54.9919 9.09686 54.1939 9.09686C53.3819 9.09686 52.7099 9.39786 52.1779 9.99986C51.6459 10.6019 51.3799 11.4279 51.3799 12.4779C51.3799 13.5839 51.6459 14.4519 52.1779 15.0819C52.4227 15.3777 52.7311 15.6145 53.0802 15.7745C53.4292 15.9345 53.81 16.0136 54.1939 16.0059ZM62.4869 4.45586H65.1539V7.12286H67.6739V9.18086H65.1539V13.6119L62.4869 15.9429V9.18086H60.6599V7.12286H62.4869V4.45586ZM67.6739 18.0009H62.4869V15.9429H67.6739V18.0009ZM76.5019 18.0009V16.4259C76.1918 16.988 75.7248 17.4477 75.1579 17.7489C74.5699 18.0709 73.8779 18.2319 73.0789 18.2319C72.4113 18.2353 71.749 18.1142 71.1259 17.8749C70.5294 17.6267 69.9925 17.2544 69.5509 16.7829C69.1029 16.2929 68.7459 15.6909 68.4809 14.9769C68.2279 14.2489 68.1019 13.4159 68.1019 12.4779C68.1019 11.5819 68.2349 10.7839 68.5019 10.0839C68.7819 9.38386 69.1449 8.79586 69.5929 8.31986C70.0419 7.85254 70.5862 7.48728 71.1889 7.24886C71.7949 6.99881 72.4443 6.87038 73.0999 6.87086C73.8839 6.87086 74.5559 7.02486 75.1159 7.33286C75.6899 7.62686 76.1309 8.02586 76.4389 8.52986V7.12286H79.1489V18.0009H76.5019ZM73.6879 16.0059C74.4579 16.0059 75.1159 15.6979 75.6619 15.0819C76.2219 14.4519 76.5019 13.5839 76.5019 12.4779C76.5019 11.4279 76.2289 10.6019 75.6829 9.99986C75.1509 9.39786 74.4859 9.09686 73.6879 9.09686C72.8759 9.09686 72.2039 9.39786 71.6719 9.99986C71.1399 10.6019 70.8739 11.4279 70.8739 12.4779C70.8739 13.5839 71.1399 14.4519 71.6719 15.0819C71.9166 15.3777 72.2251 15.6145 72.5742 15.7745C72.9232 15.9345 73.304 16.0136 73.6879 16.0059ZM81.3299 18.0009V2.88086H84.0179V18.0009H81.3299ZM92.9789 7.12286H95.7509L89.8709 21.9909H87.0989L92.9789 7.12286ZM84.7469 7.12286H87.6239L90.3119 13.8429H87.6019L84.7469 7.12286ZM100.656 18.2529C100.039 18.2564 99.4251 18.1787 98.8289 18.0219C98.2886 17.8906 97.7764 17.663 97.3169 17.3499C96.8843 17.0429 96.5199 16.6496 96.2469 16.1949C95.9669 15.7329 95.7909 15.1869 95.7209 14.5569H98.2619C98.3599 15.1309 98.6329 15.5579 99.0819 15.8379C99.5289 16.1039 100.068 16.2369 100.698 16.2369C101.216 16.2369 101.678 16.1389 102.084 15.9429C102.504 15.7329 102.714 15.4109 102.714 14.9769C102.714 14.5849 102.525 14.2909 102.147 14.0949C101.783 13.8989 101.244 13.7379 100.53 13.6119L99.4379 13.4229C98.3459 13.2409 97.4849 12.8909 96.8549 12.3729C96.2389 11.8549 95.9309 11.1759 95.9309 10.3359C95.9309 9.78986 96.0429 9.29986 96.2669 8.86586C96.5049 8.43186 96.8269 8.06786 97.2329 7.77386C97.6594 7.46999 98.1355 7.24261 98.6399 7.10186C99.205 6.93106 99.7925 6.84611 100.383 6.84986C100.971 6.84986 101.531 6.92686 102.063 7.08086C102.609 7.22086 103.085 7.43786 103.491 7.73186C103.897 8.02586 104.233 8.38286 104.499 8.80286C104.779 9.22286 104.954 9.70586 105.024 10.2519H102.525C102.399 9.78986 102.14 9.44686 101.748 9.22286C101.37 8.98486 100.894 8.86586 100.32 8.86586C99.8019 8.86586 99.3609 8.97786 98.9969 9.20186C98.6469 9.42586 98.4719 9.71986 98.4719 10.0839C98.4719 10.4339 98.6259 10.6929 98.9339 10.8609C99.2419 11.0289 99.7039 11.1619 100.32 11.2599L101.412 11.4489C102.602 11.6589 103.547 12.0229 104.247 12.5409C104.947 13.0449 105.297 13.7659 105.297 14.7039C105.297 15.2779 105.164 15.7889 104.898 16.2369C104.643 16.674 104.3 17.0531 103.89 17.3499C103.436 17.6593 102.931 17.8867 102.399 18.0219C101.831 18.1769 101.245 18.2546 100.656 18.2529ZM107.387 4.45586H110.054V7.12286H112.574V9.18086H110.054V13.6119L107.387 15.9429V9.18086H105.56V7.12286H107.387V4.45586ZM112.574 18.0009H107.387V15.9429H112.574V18.0009Z" />
    </svg>
  )
}
