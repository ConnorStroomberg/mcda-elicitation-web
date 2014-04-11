define(['angular', 'angular-mocks', 'mcda/services/remoteWorkspaces'],
  function() {
    describe('The remoteWorkspaces service', function() {

      beforeEach(module('elicit.remoteWorkspaces'));

      beforeEach(function() {
        mockPvfService = jasmine.createSpyObj('PartialValueFunction', ['create']);
        module('elicit', function($provide) {
          $provide.value('elicit.pvfService', mockPvfService);
        });
      });

      it('should something', 
        inject(function(RemoteWorkspaces) {
          var problem = {};
          var remoteWorkspaces = RemoteWorkspaces.create(problem);
        }));

    });
  });