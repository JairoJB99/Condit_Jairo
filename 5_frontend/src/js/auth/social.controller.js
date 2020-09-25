class SocialCtrl {
    constructor(User, $state, $scope, ) {
        'ngInject';

        this._User = User;
        this._$state = $state;
        this._$scope = $scope;

        this.authType = $state.current.name.replace('app.', '');
        this._User.attemptAuth(this.authType, null).then(
            (res) => {
              if(res.data.user.type == "admin"){
                this._$state.go('app.adminpanel');
              }else {
                location.reload();
                this._$state.go('app.home');
              }
            },
            (err) => {
              console.log(err);
              this._$state.go('app.home');
            }
          )
    }
}
export default SocialCtrl;
